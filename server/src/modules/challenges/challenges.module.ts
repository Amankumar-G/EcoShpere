import { Module } from '@nestjs/common';
import { EsgConfigModule } from '../esg-config/esg-config.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';

@Module({
  imports: [EsgConfigModule, NotificationsModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
})
export class ChallengesModule {}
