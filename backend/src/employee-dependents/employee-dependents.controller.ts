import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { JwtOrApiKeyGuard } from '../auth/guards/jwt-or-api-key.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { paginationQuerySchema, type PaginationQuery } from '../common/pagination';
import {
  createEmployeeDependentSchema,
  updateEmployeeDependentSchema,
  type CreateEmployeeDependentInput,
  type UpdateEmployeeDependentInput,
} from './dto/employee-dependent.dto';
import { EmployeeDependentsService } from './employee-dependents.service';
import { z } from 'zod';

const listQuerySchema = paginationQuerySchema.extend({
  employeeId: z.string().cuid().optional(),
});
type ListQuery = PaginationQuery & { employeeId?: string };

@Controller('employee-dependents')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
export class EmployeeDependentsController {
  constructor(private readonly dependents: EmployeeDependentsService) {}

  @Get()
  @RequirePermissions(Permission.HR_DEPENDENT_READ)
  findAll(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    return this.dependents.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.HR_DEPENDENT_READ)
  findOne(@Param('id') id: string) {
    return this.dependents.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.HR_DEPENDENT_CREATE)
  create(@Body(new ZodValidationPipe(createEmployeeDependentSchema)) body: CreateEmployeeDependentInput) {
    return this.dependents.create(body);
  }

  @Patch(':id')
  @RequirePermissions(Permission.HR_DEPENDENT_UPDATE)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployeeDependentSchema)) body: UpdateEmployeeDependentInput,
  ) {
    return this.dependents.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions(Permission.HR_DEPENDENT_DELETE)
  remove(@Param('id') id: string) {
    return this.dependents.remove(id);
  }
}
