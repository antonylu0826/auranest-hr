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
import { createOrgUnitSchema, updateOrgUnitSchema, type CreateOrgUnitInput, type UpdateOrgUnitInput } from './dto/org-unit.dto';
import { OrgUnitsService } from './org-units.service';

@Controller('org-units')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
export class OrgUnitsController {
  constructor(private readonly orgUnits: OrgUnitsService) {}

  @Get()
  @RequirePermissions(Permission.HR_ORG_READ)
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.orgUnits.findAll(query);
  }

  @Get('tree')
  @RequirePermissions(Permission.HR_ORG_READ)
  getTree() {
    return this.orgUnits.getTree();
  }

  @Get(':id')
  @RequirePermissions(Permission.HR_ORG_READ)
  findOne(@Param('id') id: string) {
    return this.orgUnits.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.HR_ORG_CREATE)
  create(@Body(new ZodValidationPipe(createOrgUnitSchema)) body: CreateOrgUnitInput) {
    return this.orgUnits.create(body);
  }

  @Patch(':id')
  @RequirePermissions(Permission.HR_ORG_UPDATE)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateOrgUnitSchema)) body: UpdateOrgUnitInput,
  ) {
    return this.orgUnits.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions(Permission.HR_ORG_DELETE)
  remove(@Param('id') id: string) {
    return this.orgUnits.remove(id);
  }
}
