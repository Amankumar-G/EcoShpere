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
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('products')
@Auth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Post('import')
  @Auth(Role.admin, Role.manager)
  import(@Body() dto: ImportCsvDto) {
    return this.productService.importCsv(dto.csv);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
