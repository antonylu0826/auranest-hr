import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permission } from '@prisma/client';
import { JwtOrApiKeyGuard } from '../auth/guards/jwt-or-api-key.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '../common/pagination';
import { z } from 'zod';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from './dto/employee.dto';
import { EmployeesService } from './employees.service';

const listQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
});

@Controller('employees')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  @RequirePermissions(Permission.HR_EMPLOYEE_READ)
  findAll(
    @Query(new ZodValidationPipe(listQuerySchema))
    query: PaginationQuery & { status?: string },
  ) {
    return this.employees.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.HR_EMPLOYEE_READ)
  findOne(@Param('id') id: string) {
    return this.employees.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.HR_EMPLOYEE_CREATE)
  create(
    @Body(new ZodValidationPipe(createEmployeeSchema)) body: CreateEmployeeInput,
  ) {
    return this.employees.create(body);
  }

  @Patch(':id')
  @RequirePermissions(Permission.HR_EMPLOYEE_UPDATE)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) body: UpdateEmployeeInput,
  ) {
    return this.employees.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions(Permission.HR_EMPLOYEE_DELETE)
  remove(@Param('id') id: string) {
    return this.employees.remove(id);
  }
}
