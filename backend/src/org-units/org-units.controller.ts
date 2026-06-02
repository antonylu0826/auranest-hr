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
import { createOrgUnitSchema, updateOrgUnitSchema, type CreateOrgUnitInput, type UpdateOrgUnitInput } from './dto/org-unit.dto';
import { OrgUnitsService } from './org-units.service';

@Controller('org-units')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class OrgUnitsController {
  constructor(private readonly orgUnits: OrgUnitsService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.orgUnits.findAll(query);
  }

  @Get('tree')
  getTree() {
    return this.orgUnits.getTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgUnits.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createOrgUnitSchema)) body: CreateOrgUnitInput) {
    return this.orgUnits.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOrgUnitSchema)) body: UpdateOrgUnitInput,
  ) {
    return this.orgUnits.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.orgUnits.remove(id);
  }
}
