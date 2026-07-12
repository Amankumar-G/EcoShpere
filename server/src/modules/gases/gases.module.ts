import { Module } from '@nestjs/common';
import { EmissionFactorsModule } from '../emission-factors/emission-factors.module';
import { GasesController } from './gases.controller';
import { GasesService } from './gases.service';

@Module({
  imports: [EmissionFactorsModule],
  controllers: [GasesController],
  providers: [GasesService],
})
export class GasesModule {}
