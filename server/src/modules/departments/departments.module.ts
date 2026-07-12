import { Module } from '@nestjs/common';
import { DepartmentScopeService } from './department-scope.service';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentScopeService, DepartmentsService],
  exports: [DepartmentScopeService],
})
export class DepartmentsModule {}
