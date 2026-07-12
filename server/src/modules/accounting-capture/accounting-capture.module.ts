import { Module } from '@nestjs/common';
import { AssignationRulesModule } from '../assignation-rules/assignation-rules.module';
import { EmissionFactorsModule } from '../emission-factors/emission-factors.module';
import { EsgConfigModule } from '../esg-config/esg-config.module';
import { AccountingCaptureService } from './accounting-capture.service';

@Module({
  imports: [AssignationRulesModule, EmissionFactorsModule, EsgConfigModule],
  providers: [AccountingCaptureService],
})
export class AccountingCaptureModule {}
