import { Module } from '@nestjs/common';
import { SourceDatabasesController } from './source-databases.controller';
import { SourceDatabasesService } from './source-databases.service';

@Module({
  controllers: [SourceDatabasesController],
  providers: [SourceDatabasesService],
})
export class SourceDatabasesModule {}
