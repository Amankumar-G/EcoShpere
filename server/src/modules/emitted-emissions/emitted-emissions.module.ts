import { Module } from '@nestjs/common';
import { DepartmentsModule } from '../departments/departments.module';
import { EmissionFactorsModule } from '../emission-factors/emission-factors.module';
import { EmissionScopesModule } from '../emission-scopes/emission-scopes.module';
import { EmittedEmissionsController } from './emitted-emissions.controller';
import { EmittedEmissionsService } from './emitted-emissions.service';

@Module({
  imports: [DepartmentsModule, EmissionFactorsModule, EmissionScopesModule],
  controllers: [EmittedEmissionsController],
  providers: [EmittedEmissionsService],
})
export class EmittedEmissionsModule {}
