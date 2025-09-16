import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentDoc } from './schemas/document.schema';

@Injectable()
export class DocumentsService {
  private s3: S3Client;

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
    const s3Filename = `${uuidv4()}-${originalFilename}`;
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

  private getMimeType(filename: string): string {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.endsWith('.docx'))
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return 'application/octet-stream';
  }
}
