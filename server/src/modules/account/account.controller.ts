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
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Controller('accounts')
@Auth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto);
  }

  @Post('import')
  @Auth(Role.admin, Role.manager)
  import(@Body() dto: ImportCsvDto) {
    return this.accountService.importCsv(dto.csv);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAccountDto) {
    return this.accountService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.remove(id);
  }
}
