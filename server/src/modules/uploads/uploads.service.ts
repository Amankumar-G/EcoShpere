import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';
import type {
  StorageProvider,
  StoredFile,
  UploadedFileData,
} from './storage/storage-provider.interface';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  save(file: UploadedFileData): Promise<StoredFile> {
    return this.storage.save(file);
  }

  resolvePath(filename: string): string {
    return this.storage.resolvePath(filename);
  }
}
