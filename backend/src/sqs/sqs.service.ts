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

      // S3 event notifications have a Records array
      if (!body.Records || body.Records.length === 0) {
        this.logger.warn('No Records in message body, skipping');
        return;
      }

      const record = body.Records[0];
      s3Info = {
        bucket: { name: record.s3.bucket.name },
        object: { key: record.s3.object.key },
      };

      this.logger.log(`Processing S3 file: ${s3Info.object.key}`);

      // Download file from S3
      const fileBuffer = await this.downloadFile(
        s3Info.bucket.name,
        s3Info.object.key,
      );

      // Parse file content
      const text = s3Info.object.key.endsWith('.pdf')
        ? await parsePdf(fileBuffer)
        : await parseDocx(fileBuffer);

      // Index into OpenSearch
      await OpenSearchClient.index({
        index: 'documents',
        body: { text, metadata: s3Info.object.key },
      });

      // Update MongoDB document status
      await this.documentsService.updateStatus(s3Info.object.key, 'success');

      // Delete the message from SQS
      if (msg.ReceiptHandle) {
        await this.sqs.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: msg.ReceiptHandle,
          }),
        );
      }
    } catch (err) {
      this.logger.error('Error handling SQS message', err as any);

      // Update document status to error in MongoDB
      if (s3Info) {
        try {
          await this.documentsService.updateStatus(s3Info.object.key, 'error');
        } catch (mongoErr) {
          this.logger.error(
            'Failed to update document status',
            mongoErr as any,
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
