import { Body, Controller, Post } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body() body: { userEmail: string; originalFilename: string },
  ) {
    return this.documentsService.generateUploadUrl(
      body.userEmail,
      body.originalFilename,
    );
  }
}
