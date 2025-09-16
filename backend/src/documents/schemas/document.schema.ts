import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentEntity = Document & DocumentDoc;

@Schema({ timestamps: true })
export class DocumentDoc {
  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  userFilename: string;

  @Prop({ required: true, unique: true })
  s3Filename: string;

  @Prop({ required: true, enum: ['pending', 'success', 'error'] })
  status: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentDoc);
