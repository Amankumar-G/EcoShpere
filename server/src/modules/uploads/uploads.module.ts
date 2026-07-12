import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';
import { LocalDiskStorageProvider } from './storage/local-disk-storage.provider';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    { provide: STORAGE_PROVIDER, useClass: LocalDiskStorageProvider },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
