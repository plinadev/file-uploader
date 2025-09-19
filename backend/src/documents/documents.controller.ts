/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { map, Observable } from 'rxjs';

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

  @Sse('stream')
  stream(@Query('userEmail') userEmail: string): Observable<MessageEvent<any>> {
    if (!userEmail) {
      throw new Error('userEmail is required');
    }

    return this.documentsService.subscribeToUser(userEmail).pipe(
      map(
        (docUpdate) =>
          ({
            data: docUpdate,
          }) as MessageEvent<any>,
      ),
    );
  }
}
