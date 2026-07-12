import { Module } from '@nestjs/common';
import { EmissionScopeTreeService } from './emission-scope-tree.service';
import { EmissionScopesController } from './emission-scopes.controller';
import { EmissionScopesService } from './emission-scopes.service';

@Module({
  controllers: [EmissionScopesController],
  providers: [EmissionScopeTreeService, EmissionScopesService],
  exports: [EmissionScopeTreeService],
})
export class EmissionScopesModule {}
