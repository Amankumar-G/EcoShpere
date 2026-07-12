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
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { AssignationRulesService } from './assignation-rules.service';
import { AssignationRuleResponseDto } from './dto/assignation-rule-response.dto';
import { CreateAssignationRuleDto } from './dto/create-assignation-rule.dto';
import { UpdateAssignationRuleDto } from './dto/update-assignation-rule.dto';

@Controller('assignation-rules')
export class AssignationRulesController {
  constructor(
    private readonly assignationRulesService: AssignationRulesService,
  ) {}

  @Get()
  @Auth(Role.admin)
  list(): Promise<AssignationRuleResponseDto[]> {
    return this.assignationRulesService.list();
  }

  @Get(':id')
  @Auth(Role.admin)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AssignationRuleResponseDto> {
    return this.assignationRulesService.findOne(id);
  }

  @Post()
  @Auth(Role.admin)
  create(
    @Body() dto: CreateAssignationRuleDto,
  ): Promise<AssignationRuleResponseDto> {
    return this.assignationRulesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignationRuleDto,
  ): Promise<AssignationRuleResponseDto> {
    return this.assignationRulesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assignationRulesService.remove(id);
  }
}
