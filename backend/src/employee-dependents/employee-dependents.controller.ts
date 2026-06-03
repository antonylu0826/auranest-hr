import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EmployeeDependentsController {
  constructor(private readonly dependents: EmployeeDependentsService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQuery) {
    return this.dependents.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dependents.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createEmployeeDependentSchema)) body: CreateEmployeeDependentInput) {
    return this.dependents.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployeeDependentSchema)) body: UpdateEmployeeDependentInput,
  ) {
    return this.dependents.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.dependents.remove(id);
  }
}
