import { Module } from '@nestjs/common';
import { AssignationMatchService } from './assignation-match.service';
import { AssignationRulesController } from './assignation-rules.controller';
import { AssignationRulesService } from './assignation-rules.service';

@Module({
  controllers: [AssignationRulesController],
  providers: [AssignationRulesService, AssignationMatchService],
  exports: [AssignationMatchService],
})
export class AssignationRulesModule {}
