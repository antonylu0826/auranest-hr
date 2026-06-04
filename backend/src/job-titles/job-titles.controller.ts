import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtOrApiKeyGuard } from '../auth/guards/jwt-or-api-key.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { paginationQuerySchema, type PaginationQuery } from '../common/pagination';
import { createJobTitleSchema, updateJobTitleSchema, type CreateJobTitleInput, type UpdateJobTitleInput } from './dto/job-title.dto';
import { JobTitlesService } from './job-titles.service';

@Controller('job-titles')
@UseGuards(JwtOrApiKeyGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class JobTitlesController {
  constructor(private readonly jobTitles: JobTitlesService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery) {
    return this.jobTitles.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobTitles.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createJobTitleSchema)) body: CreateJobTitleInput) {
    return this.jobTitles.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateJobTitleSchema)) body: UpdateJobTitleInput) {
    return this.jobTitles.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.jobTitles.remove(id);
  }
}
