import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import {
  EmployeeListResponseDto,
  EmployeeResponseDto,
} from './dto/employee-response.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Auth(Role.admin, Role.manager)
  list(
    @CurrentUser() actor: AuthUser,
    @Query() query: EmployeeQueryDto,
  ): Promise<EmployeeListResponseDto> {
    return this.employeesService.list(actor, query);
  }

  @Get(':id')
  @Auth(Role.admin, Role.manager)
  findOne(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.findOne(actor, id);
  }

  @Post()
  @Auth(Role.admin)
  create(
    @CurrentUser() actor: AuthUser,
    @Body() dto: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.create(actor, dto);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.update(actor, id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.employeesService.remove(actor, id);
  }
}
