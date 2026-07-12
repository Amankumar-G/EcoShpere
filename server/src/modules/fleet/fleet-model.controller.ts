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
import { Role } from '@prisma/client';
import { ImportCsvDto } from '../../common/csv/import-csv.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateFleetModelDto, UpdateFleetModelDto } from './dto/fleet.dto';
import { FleetService } from './fleet.service';

@Controller('fleet/models')
@Auth()
export class FleetModelController {
  constructor(private readonly fleetService: FleetService) {}

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreateFleetModelDto) {
    return this.fleetService.createModel(dto);
  }

  @Post('import')
  @Auth(Role.admin, Role.manager)
  import(@Body() dto: ImportCsvDto) {
    return this.fleetService.importModelsCsv(dto.csv);
  }

  @Get()
  findAll() {
    return this.fleetService.findAllModels();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.findModel(id);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFleetModelDto,
  ) {
    return this.fleetService.updateModel(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.removeModel(id);
  }
}
