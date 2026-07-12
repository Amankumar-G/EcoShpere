import { Body, Controller, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { FleetCommutingRunResultDto } from './dto/fleet-commuting-run-result.dto';
import { RunFleetCommutingDto } from './dto/run-fleet-commuting.dto';
import { FleetCommutingService } from './fleet-commuting.service';

@Controller('fleet-commuting')
export class FleetCommutingController {
  constructor(private readonly fleetCommutingService: FleetCommutingService) {}

  @Post('run')
  @Auth(Role.admin)
  run(@Body() dto: RunFleetCommutingDto): Promise<FleetCommutingRunResultDto> {
    return this.fleetCommutingService.run(dto.period);
  }
}
