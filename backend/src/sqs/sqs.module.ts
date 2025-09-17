import { Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { DocumentsModule } from 'src/documents/documents.module';

@Module({
  imports: [DocumentsModule],
  providers: [SqsService],
})
export class SqsModule {}
