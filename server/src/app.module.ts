import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { EmissionFactorsModule } from './modules/emission-factors/emission-factors.module';
import { EmissionScopesModule } from './modules/emission-scopes/emission-scopes.module';
import { EmittedEmissionsModule } from './modules/emitted-emissions/emitted-emissions.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { EsgConfigModule } from './modules/esg-config/esg-config.module';
import { GasesModule } from './modules/gases/gases.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SourceDatabasesModule } from './modules/source-databases/source-databases.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    DepartmentsModule,
    EmissionFactorsModule,
    EmissionScopesModule,
    EmittedEmissionsModule,
    EmployeesModule,
    EsgConfigModule,
    GasesModule,
    NotificationsModule,
    SourceDatabasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
