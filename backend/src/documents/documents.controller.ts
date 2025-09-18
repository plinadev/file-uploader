import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
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
  async listDocuments(
    @Query('userEmail') userEmail: string,
    @Query('search') search?: string,
  ) {
    return this.documentsService.findByUserEmail(userEmail, search);
  }
  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
