import { Module } from '@nestjs/common';
import { GasesController } from './gases.controller';
import { GasesService } from './gases.service';

@Module({
  controllers: [GasesController],
  providers: [GasesService],
})
export class GasesModule {}
