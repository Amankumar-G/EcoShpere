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
import { Authenticated } from '../auth/decorators/authenticated.decorator';
import {
  CreateBusinessTravelDto,
  UpdateBusinessTravelDto,
} from './dto/business-travel.dto';
import { BusinessTravelService } from './business-travel.service';

@Controller('business-travels')
@Authenticated()
export class BusinessTravelController {
  constructor(private readonly businessTravelService: BusinessTravelService) {}

  @Post()
  create(@Body() dto: CreateBusinessTravelDto) {
    return this.businessTravelService.create(dto);
  }

  @Get()
  findAll() {
    return this.businessTravelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.businessTravelService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusinessTravelDto,
  ) {
    return this.businessTravelService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.businessTravelService.remove(id);
  }
}
