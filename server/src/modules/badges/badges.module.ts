import { Module } from '@nestjs/common';
import { EsgConfigModule } from '../esg-config/esg-config.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { BadgesListener } from './badges.listener';

@Module({
  imports: [EsgConfigModule, NotificationsModule],
  controllers: [BadgesController],
  providers: [BadgesService, BadgesListener],
  exports: [BadgesService],
})
export class BadgesModule {}
