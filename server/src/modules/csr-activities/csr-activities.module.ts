import { Module } from '@nestjs/common';
import { EsgConfigModule } from '../esg-config/esg-config.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CsrActivitiesController } from './csr-activities.controller';
import { CsrActivitiesService } from './csr-activities.service';

@Module({
  imports: [EsgConfigModule, NotificationsModule],
  controllers: [CsrActivitiesController],
  providers: [CsrActivitiesService],
})
export class CsrActivitiesModule {}
