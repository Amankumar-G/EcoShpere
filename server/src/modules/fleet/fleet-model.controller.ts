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
import { ImportCsvDto } from '../../common/csv/import-csv.dto';
import { Authenticated } from '../auth/decorators/authenticated.decorator';
import { CreateFleetModelDto, UpdateFleetModelDto } from './dto/fleet.dto';
import { FleetService } from './fleet.service';

@Controller('fleet/models')
@Authenticated()
export class FleetModelController {
  constructor(private readonly fleetService: FleetService) {}

  @Post()
  create(@Body() dto: CreateFleetModelDto) {
    return this.fleetService.createModel(dto);
  }

  @Post('import')
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFleetModelDto,
  ) {
    return this.fleetService.updateModel(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fleetService.removeModel(id);
  }
}
