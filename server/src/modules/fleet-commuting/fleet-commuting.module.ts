import { Module } from '@nestjs/common';
import { EsgConfigModule } from '../esg-config/esg-config.module';
import { FleetCommutingController } from './fleet-commuting.controller';
import { FleetCommutingService } from './fleet-commuting.service';

@Module({
  imports: [EsgConfigModule],
  controllers: [FleetCommutingController],
  providers: [FleetCommutingService],
})
export class FleetCommutingModule {}
