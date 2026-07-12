import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { EsgConfigService } from './esg-config.service';
import { SetEsgConfigValueDto } from './dto/set-esg-config-value.dto';

@Controller('esg-config')
export class EsgConfigController {
  constructor(private readonly esgConfigService: EsgConfigService) {}

  @Auth(Role.admin, Role.manager)
  @Get(':key')
  getValue(@Param('key') key: string): Promise<unknown> {
    return this.esgConfigService.get(key);
  }

  @Auth(Role.admin)
  @Patch(':key')
  setValue(
    @Param('key') key: string,
    @Body() dto: SetEsgConfigValueDto,
  ): Promise<unknown> {
    return this.esgConfigService.set(key, dto.value);
  }
}
