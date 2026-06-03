import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EmployeeDependentsModule } from './employee-dependents/employee-dependents.module';
import { EmployeesModule } from './employees/employees.module';
import { HealthModule } from './health/health.module';
import { JobTitlesModule } from './job-titles/job-titles.module';
import { MetaModule } from './meta/meta.module';
import { OrgUnitsModule } from './org-units/org-units.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShiftTypesModule } from './shift-types/shift-types.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, UsersModule, EmployeesModule, EmployeeDependentsModule, OrgUnitsModule, ShiftTypesModule, JobTitlesModule, MetaModule],
})
export class AppModule {}
