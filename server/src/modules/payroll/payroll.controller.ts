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
import { Auth } from '../auth/decorators/auth.decorator';
import {
  CreatePayrollContractDto,
  UpdatePayrollContractDto,
} from './dto/payroll.dto';
import { PayrollService } from './payroll.service';

// Payroll data feeds the pay-gap scoring formula and is admin-only.
@Controller('payroll-contracts')
@Auth(Role.admin)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  create(@Body() dto: CreatePayrollContractDto) {
    return this.payrollService.create(dto);
  }

  @Get()
  findAll() {
    return this.payrollService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayrollContractDto,
  ) {
    return this.payrollService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.remove(id);
  }
}
