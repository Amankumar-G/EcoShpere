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
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';
import { PartnerService } from './partner.service';

@Controller('partners')
@Auth()
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreatePartnerDto) {
    return this.partnerService.create(dto);
  }

  @Post('import')
  @Auth(Role.admin, Role.manager)
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
  @Auth(Role.admin, Role.manager)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartnerDto) {
    return this.partnerService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.remove(id);
  }
}
