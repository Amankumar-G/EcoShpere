import { Module } from '@nestjs/common';
import { BusinessTravelController } from './business-travel.controller';
import { BusinessTravelService } from './business-travel.service';

@Module({
  controllers: [BusinessTravelController],
  providers: [BusinessTravelService],
  exports: [BusinessTravelService],
})
export class BusinessTravelModule {}
