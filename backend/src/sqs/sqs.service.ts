/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DocumentsService } from '../documents/documents.service';
import { parseDocx, parsePdf } from 'src/utils/file-parsers';
import { OpenSearchClient } from 'src/lib/opensearch.client';

interface S3Record {
  bucket: { name: string };
  object: { key: string };
}

@Injectable()
export class SqsService {
  private sqs: SQSClient;
  private s3: S3Client;
  private logger = new Logger(SqsService.name);

  constructor(private documentsService: DocumentsService) {
    this.sqs = new SQSClient({ region: process.env.AWS_REGION });
    this.s3 = new S3Client({ region: process.env.AWS_REGION });
  }

  /** Start polling SQS indefinitely */
  async startPolling() {
    const queueUrl = process.env.AWS_SQS_URL!;
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    while (true) {
      try {
        const data = await this.sqs.send(new ReceiveMessageCommand(params));
        if (!data.Messages || data.Messages.length === 0) continue;

        for (const msg of data.Messages) {
          await this.handleMessage(msg, queueUrl);
        }
      } catch (err) {
        this.logger.error('Error polling SQS', err as any);
      }
    }
  }

  /** Handle a single SQS message */
  private async handleMessage(msg: Message, queueUrl: string) {
    let s3Info: S3Record | null = null;

    try {
      if (!msg.Body) {
        this.logger.warn('Empty message body received, skipping');
        return;
      }

      const body = JSON.parse(msg.Body);
      if (!body.Records || body.Records.length === 0) {
        this.logger.warn('No Records in message body, skipping');
        return;
      }

      const record = body.Records[0];
      if (!record.s3 || !record.s3.bucket?.name || !record.s3.object?.key) {
        this.logger.warn('Invalid S3 record, skipping');
        return;
      }

      s3Info = {
        bucket: { name: record.s3.bucket.name },
        object: { key: decodeURIComponent(record.s3.object.key as string) },
      };

      this.logger.log(`Processing S3 file: ${s3Info.object.key}`);

      let fileBuffer: Buffer | null = null;

      try {
        fileBuffer = await this.downloadFile(
          s3Info.bucket.name,
          s3Info.object.key,
        );
      } catch (s3Err) {
        this.logger.error(
          `Failed to download S3 file: ${s3Info.object.key}`,
          s3Err,
        );

        try {
          await this.documentsService.updateStatus(s3Info.object.key, 'error');
        } catch (dbErr) {
          this.logger.warn(
            `Could not update status in MongoDB for ${s3Info.object.key} (maybe already deleted)`,
            dbErr,
          );
        }

        // Always delete the SQS message so it won’t retry forever
        if (msg.ReceiptHandle) {
          try {
            await this.sqs.send(
              new DeleteMessageCommand({
                QueueUrl: queueUrl,
                ReceiptHandle: msg.ReceiptHandle,
              }),
            );
          } catch (delErr) {
            this.logger.error(
              'Failed to delete SQS message after S3 error',
              delErr,
            );
          }
        }

        return;
      }

      // Parse file content
      let text = '';
      try {
        text = s3Info.object.key.endsWith('.pdf')
          ? await parsePdf(fileBuffer)
          : await parseDocx(fileBuffer);
      } catch (parseErr) {
        this.logger.error(
          `Failed to parse file: ${s3Info.object.key}`,
          parseErr,
        );
        await this.documentsService.updateStatus(s3Info.object.key, 'error');
        return;
      }

      // Index into OpenSearch
      try {
        const document = await this.documentsService.findByS3Key(
          s3Info.object.key,
        );

        if (!document) {
          this.logger.warn(
            `No MongoDB document found for S3 key: ${s3Info.object.key}`,
          );
          return;
        }
        await OpenSearchClient.index({
          index: 'documents',
          id: document._id.toString(),
          body: {
            text,
            metadata: document.userFilename,
            userEmail: document.userEmail,
            uploadedAt: document.uploadedAt,
            s3Filename: document.s3Filename,
          },
          refresh: true,
        });
      } catch (osErr) {
        this.logger.error(
          `Failed to index file in OpenSearch: ${s3Info.object.key}`,
          osErr,
        );
        await this.documentsService.updateStatus(s3Info.object.key, 'error');
        return;
      }

      // Success: update status
      await this.documentsService.updateStatus(s3Info.object.key, 'success');

      // Delete message from SQS
      if (msg.ReceiptHandle) {
        await this.sqs.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: msg.ReceiptHandle,
          }),
        );
      }
    } catch (err) {
      this.logger.error('Unexpected error handling SQS message', err);
      // Try to mark as error and delete message to prevent endless retries
      if (s3Info?.object?.key && msg.ReceiptHandle) {
        try {
          await this.documentsService.updateStatus(s3Info.object.key, 'error');
          await this.sqs.send(
            new DeleteMessageCommand({
              QueueUrl: queueUrl,
              ReceiptHandle: msg.ReceiptHandle,
            }),
          );
        } catch (cleanupErr) {
          this.logger.error(
            'Failed to mark document as error or delete SQS message',
            cleanupErr,
          );
        }
      }
    }
  }

  /** Download a file from S3 and return as Buffer */
  private async downloadFile(bucket: string, key: string): Promise<Buffer> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const data = await this.s3.send(command);

    if (!data.Body) {
      throw new Error(`S3 object ${key} is empty`);
    }

    // Transform readable stream to Buffer
    const arrayBuffer = await data.Body.transformToByteArray();
    return Buffer.from(arrayBuffer);
  }
}
