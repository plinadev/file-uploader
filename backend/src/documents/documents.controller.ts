import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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

  @Get()
  async listDocuments(@Query('userEmail') userEmail: string) {
    return this.documentsService.findByUserEmail(userEmail);
  }
}
