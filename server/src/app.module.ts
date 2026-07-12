import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessTravelModule } from './modules/business-travel/business-travel.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { EmissionFactorsModule } from './modules/emission-factors/emission-factors.module';
import { EmissionScopesModule } from './modules/emission-scopes/emission-scopes.module';
import { EmittedEmissionsModule } from './modules/emitted-emissions/emitted-emissions.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { EsgConfigModule } from './modules/esg-config/esg-config.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { GasesModule } from './modules/gases/gases.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PartnerModule } from './modules/partner/partner.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ProductModule } from './modules/product/product.module';
import { SourceDatabasesModule } from './modules/source-databases/source-databases.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
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
    // Phase 1 — operational records
    AccountModule,
    PartnerModule,
    ProductModule,
    InvoiceModule,
    ExpenseModule,
    FleetModule,
    BusinessTravelModule,
    PayrollModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
