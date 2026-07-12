import { createReadStream, existsSync } from 'node:fs';
import { extname } from 'node:path';
import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorator';
import { UploadsService } from './uploads.service';
import type { UploadedFileData } from './storage/storage-provider.interface';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = /(pdf|png|jpe?g|gif|webp)$/;

const INLINE_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  /** Any authenticated user may upload a proof / policy document. */
  @Post()
  @Auth()
  @UseInterceptors(
    // No `storage` option → multer defaults to in-memory (file.buffer).
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }),
  )
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_TYPES }),
        ],
      }),
    )
    file: UploadedFileData,
  ) {
    return this.uploads.save(file);
  }

  /** Public read so uploaded images/PDFs render directly in the browser. */
  @Get(':filename')
  serve(@Param('filename') filename: string): StreamableFile {
    const path = this.uploads.resolvePath(filename);
    if (!existsSync(path)) {
      throw new NotFoundException('File not found');
    }
    const type = INLINE_MIME[extname(filename).toLowerCase()];
    return new StreamableFile(createReadStream(path), {
      type,
      disposition: 'inline',
    });
  }
}
