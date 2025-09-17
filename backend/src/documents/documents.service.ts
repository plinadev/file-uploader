import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentDoc } from './schemas/document.schema';

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

  async findByUserEmail(userEmail: string) {
    try {
      const docs = await this.documentModel
        .find({ userEmail })
        .select('userFilename uploadedAt status s3Filename')
        .sort({ uploadedAt: -1 })
        .exec();

      const results = await Promise.all(
        docs.map(async (doc) => {
          let fileUrl: string | null = null;

          if (doc.s3Filename) {
            try {
              // Generate a signed URL valid for 5 minutes
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
            fileUrl, // <-- pre-signed URL for frontend preview/download
          };
        }),
      );

      return results;
    } catch (err) {
      this.logger.error('Error fetching documents', err);
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  private getMimeType(filename: string): string {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.endsWith('.docx'))
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'application/octet-stream';
  }
}
