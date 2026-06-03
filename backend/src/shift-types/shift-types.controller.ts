import {
  Body, Controller, Delete, Get, HttpCode,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { paginationQuerySchema, type PaginationQuery } from '../common/pagination';
import { createShiftTypeSchema, updateShiftTypeSchema, type CreateShiftTypeInput, type UpdateShiftTypeInput } from './dto/shift-type.dto';
import { ShiftTypesService } from './shift-types.service';

@Controller('shift-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ShiftTypesController {
  constructor(private readonly shiftTypes: ShiftTypesService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.shiftTypes.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftTypes.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createShiftTypeSchema)) body: CreateShiftTypeInput) {
    return this.shiftTypes.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateShiftTypeSchema)) body: UpdateShiftTypeInput,
  ) {
    return this.shiftTypes.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.shiftTypes.remove(id);
  }
}
