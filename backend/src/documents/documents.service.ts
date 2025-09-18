/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentDoc } from './schemas/document.schema';
import { OpenSearchClient } from 'src/lib/opensearch.client';
@Injectable()
export class DocumentsService {
  private s3: S3Client;
  private logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(DocumentDoc.name)
    private documentModel: Model<DocumentDoc>,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async generateUploadUrl(userEmail: string, originalFilename: string) {
    const sanitizedFilename = originalFilename.replace(/\s+/g, '_');
    const s3Filename = `${uuidv4()}-${sanitizedFilename}`;
    const bucket = process.env.AWS_S3_BUCKET;

    // Create S3 command for upload
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Filename,
      ContentType: this.getMimeType(originalFilename),
    });

    // Generate pre-signed URL (valid for 60s)
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 60 });

    // Save metadata to MongoDB
    const document = new this.documentModel({
      userEmail,
      userFilename: originalFilename,
      s3Filename,
      status: 'pending',
      uploadedAt: new Date(),
    });

    await document.save();

    return {
      uploadUrl,
      s3Filename,
      documentId: document._id,
    };
  }
  async updateStatus(s3Filename: string, status: 'success' | 'error') {
    await this.documentModel.updateOne({ s3Filename }, { status });
  }

  async findByUserEmail(userEmail: string, search?: string) {
    try {
      let mongoDocsMap: Record<string, any> = {};
      let hits: any[] = [];

      if (search) {
        const result = await OpenSearchClient.search({
          index: 'documents',
          body: {
            query: {
              bool: {
                must: [
                  {
                    match: {
                      text: {
                        query: search,
                        fuzziness: 'AUTO',
                      },
                    },
                  },
                ],
                filter: [{ match: { userEmail } }], // exact match on userEmail
              },
            },
            highlight: {
              fields: { text: {} },
              pre_tags: ['<mark>'],
              post_tags: ['</mark>'],
            },
          },
        });

        hits = (result.body as any).hits?.hits ?? [];
        const ids = hits.map((hit: any) => hit._id);

        // 2️⃣ Fetch MongoDB documents for these IDs
        const mongoDocs = await this.documentModel
          .find({ _id: { $in: ids } })
          .exec();

        mongoDocsMap = mongoDocs.reduce(
          (acc, doc) => {
            acc[doc._id.toString()] = doc;
            return acc;
          },
          {} as Record<string, any>,
        );
      } else {
        // 3️⃣ No search → get all docs for this user
        const mongoDocs = await this.documentModel.find({ userEmail }).exec();
        hits = mongoDocs.map((doc) => ({ _id: doc._id.toString() }));
        mongoDocsMap = mongoDocs.reduce(
          (acc, doc) => {
            acc[doc._id.toString()] = doc;
            return acc;
          },
          {} as Record<string, any>,
        );
      }

      // 4️⃣ Build final result array with S3 URLs
      const results = await Promise.all(
        hits.map(async (hit: any) => {
          const doc = mongoDocsMap[hit._id];
          if (!doc) return null;

          let fileUrl: string | null = null;
          if (doc.s3Filename) {
            try {
              const command = new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: doc.s3Filename,
              });
              fileUrl = await getSignedUrl(this.s3, command, {
                expiresIn: 300,
              });
            } catch (s3Err) {
              this.logger.error(
                `Failed to generate signed URL for ${doc.s3Filename}`,
                s3Err,
              );
            }
          }

          return {
            id: doc._id,
            userFilename: doc.userFilename,
            uploadedAt: doc.uploadedAt,
            status: doc.status,
            s3Filename: doc.s3Filename,
            fileUrl,
            snippet: hit.highlight?.text?.[0] ?? null, // highlight from OpenSearch
          };
        }),
      );

      return results.filter(Boolean); // remove nulls just in case
    } catch (err) {
      this.logger.error('Error fetching documents', err);
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  async deleteDocument(documentId: string) {
    const doc = await this.documentModel.findById(documentId);
    if (!doc) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }
    const bucket = process.env.AWS_S3_BUCKET;
    const s3Key = doc.s3Filename;

    try {
      //deleting from s3
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: s3Key,
        }),
      );

      //deleting from opensearch
      try {
        await OpenSearchClient.delete({
          index: 'documents',
          id: documentId,
        });
      } catch (osErr) {
        this.logger.warn(
          `Failed to delete from OpenSearch from ${documentId}`,
          osErr,
        );
      }

      //deleting from mongodb
      await this.documentModel.deleteOne({ _id: documentId });

      this.logger.log(`Deleted document ${documentId}`);
    } catch (error) {
      this.logger.error(`Failed to delete document ${documentId}`, error);
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async findByS3Key(s3Key: string) {
    return this.documentModel.findOne({ s3Filename: s3Key }).exec();
  }

  private getMimeType(filename: string): string {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.endsWith('.docx'))
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'application/octet-stream';
  }
}
