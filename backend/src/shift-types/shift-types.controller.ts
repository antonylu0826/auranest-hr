import {
  Body, Controller, Delete, Get, HttpCode,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { Permission } from '@prisma/client';
import { JwtOrApiKeyGuard } from '../auth/guards/jwt-or-api-key.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { paginationQuerySchema, type PaginationQuery } from '../common/pagination';
import { createShiftTypeSchema, updateShiftTypeSchema, type CreateShiftTypeInput, type UpdateShiftTypeInput } from './dto/shift-type.dto';
import { ShiftTypesService } from './shift-types.service';

@Controller('shift-types')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
export class ShiftTypesController {
  constructor(private readonly shiftTypes: ShiftTypesService) {}

  @Get()
  @RequirePermissions(Permission.HR_SHIFT_READ)
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.shiftTypes.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.HR_SHIFT_READ)
  findOne(@Param('id') id: string) {
    return this.shiftTypes.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.HR_SHIFT_CREATE)
  create(@Body(new ZodValidationPipe(createShiftTypeSchema)) body: CreateShiftTypeInput) {
    return this.shiftTypes.create(body);
  }

  @Patch(':id')
  @RequirePermissions(Permission.HR_SHIFT_UPDATE)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateShiftTypeSchema)) body: UpdateShiftTypeInput,
  ) {
    return this.shiftTypes.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions(Permission.HR_SHIFT_DELETE)
  remove(@Param('id') id: string) {
    return this.shiftTypes.remove(id);
  }
}
