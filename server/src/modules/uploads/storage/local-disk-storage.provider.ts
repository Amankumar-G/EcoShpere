import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import {
  StorageProvider,
  StoredFile,
  UploadedFileData,
} from './storage-provider.interface';

/**
 * Writes uploads to a local directory (default `./uploads`). Filenames are
 * randomised UUIDs so uploads never collide or leak the original name, and
 * `resolvePath` strips path components to prevent traversal on read.
 */
@Injectable()
export class LocalDiskStorageProvider implements StorageProvider {
  private readonly uploadDir = process.env.UPLOAD_DIR ?? './uploads';

  async save(file: UploadedFileData): Promise<StoredFile> {
    await mkdir(this.uploadDir, { recursive: true });
    const filename = `${randomUUID()}${extname(file.originalname)}`;
    await writeFile(join(this.uploadDir, filename), file.buffer);
    return { filename, url: `/uploads/${filename}` };
  }

  resolvePath(filename: string): string {
    // basename() defeats `../` traversal attempts in the requested name.
    return join(this.uploadDir, basename(filename));
  }
}
