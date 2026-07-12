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
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { PartnerService } from './partner.service';

@Controller('partners')
@Authenticated()
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  create(@Body() dto: CreatePartnerDto) {
    return this.partnerService.create(dto);
  }

  @Post('import')
  import(@Body() dto: ImportCsvDto) {
    return this.partnerService.importCsv(dto.csv);
  }

  @Get()
  findAll() {
    return this.partnerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartnerDto) {
    return this.partnerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.remove(id);
  }
}
