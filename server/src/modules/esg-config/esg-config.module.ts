import { Module } from '@nestjs/common';
import { EsgConfigController } from './esg-config.controller';
import { EsgConfigService } from './esg-config.service';

@Module({
  controllers: [EsgConfigController],
  providers: [EsgConfigService],
  exports: [EsgConfigService],
})
export class EsgConfigModule {}
