import { Module } from '@nestjs/common';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { EmployeeDependentsController } from './employee-dependents.controller';
import { EmployeeDependentsService } from './employee-dependents.service';

@Module({
  imports: [ApiKeysModule],
  controllers: [EmployeeDependentsController],
  providers: [EmployeeDependentsService],
})
export class EmployeeDependentsModule {}
