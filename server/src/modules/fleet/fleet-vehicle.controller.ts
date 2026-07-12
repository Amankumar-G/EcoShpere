import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateFleetVehicleDto, UpdateFleetVehicleDto } from './dto/fleet.dto';
import { FleetService } from './fleet.service';

@Controller('fleet/vehicles')
@Auth()
export class FleetVehicleController {
  constructor(private readonly fleetService: FleetService) {}

  @Post()
  create(@Body() dto: CreateFleetVehicleDto) {
    return this.fleetService.createVehicle(dto);
  }

  @Get()
  findAll() {
    return this.fleetService.findAllVehicles();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.findVehicle(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFleetVehicleDto,
  ) {
    return this.fleetService.updateVehicle(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.removeVehicle(id);
  }
}
