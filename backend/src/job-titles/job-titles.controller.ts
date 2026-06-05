import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { JwtOrApiKeyGuard } from '../auth/guards/jwt-or-api-key.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { paginationQuerySchema, type PaginationQuery } from '../common/pagination';
import { createJobTitleSchema, updateJobTitleSchema, type CreateJobTitleInput, type UpdateJobTitleInput } from './dto/job-title.dto';
import { JobTitlesService } from './job-titles.service';

@Controller('job-titles')
@UseGuards(JwtOrApiKeyGuard, PermissionGuard)
export class JobTitlesController {
  constructor(private readonly jobTitles: JobTitlesService) {}

  @Get()
  @RequirePermissions(Permission.HR_JOB_READ)
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.jobTitles.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.HR_JOB_READ)
  findOne(@Param('id') id: string) {
    return this.jobTitles.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.HR_JOB_CREATE)
  create(@Body(new ZodValidationPipe(createJobTitleSchema)) body: CreateJobTitleInput) {
    return this.jobTitles.create(body);
  }

  @Patch(':id')
  @RequirePermissions(Permission.HR_JOB_UPDATE)
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateJobTitleSchema)) body: UpdateJobTitleInput) {
    return this.jobTitles.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions(Permission.HR_JOB_DELETE)
  remove(@Param('id') id: string) {
    return this.jobTitles.remove(id);
  }
}
