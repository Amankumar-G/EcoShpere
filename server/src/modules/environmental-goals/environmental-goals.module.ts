import { Module } from '@nestjs/common';
import { EnvironmentalGoalsController } from './environmental-goals.controller';
import { EnvironmentalGoalsService } from './environmental-goals.service';

@Module({
  controllers: [EnvironmentalGoalsController],
  providers: [EnvironmentalGoalsService],
})
export class EnvironmentalGoalsModule {}
