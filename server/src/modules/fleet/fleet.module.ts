import { Module } from '@nestjs/common';
import { FleetModelController } from './fleet-model.controller';
import { FleetVehicleController } from './fleet-vehicle.controller';
import { FleetService } from './fleet.service';

@Module({
  controllers: [FleetModelController, FleetVehicleController],
  providers: [FleetService],
  exports: [FleetService],
})
export class FleetModule {}
