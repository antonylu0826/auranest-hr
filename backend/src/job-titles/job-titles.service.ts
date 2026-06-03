import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, toPrismaOrderBy, toPrismaPage, type PaginationQuery } from '../common/pagination';
import type { CreateJobTitleInput, UpdateJobTitleInput } from './dto/job-title.dto';

const SORTABLE = ['name', 'code', 'department', 'grade', 'isActive', 'createdAt'] as const;

@Injectable()
export class JobTitlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { skip, take } = toPrismaPage(query);
    const orderBy = toPrismaOrderBy(query, SORTABLE, { name: 'asc' });
    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { code: { contains: query.search, mode: 'insensitive' as const } },
            { department: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [data, total] = await Promise.all([
      this.prisma.jobTitle.findMany({ where, skip, take, orderBy }),
      this.prisma.jobTitle.count({ where }),
    ]);
    return paginate(data, total);
  }

  async findOne(id: string) {
    const found = await this.prisma.jobTitle.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Job title not found');
    return found;
  }

  async create(input: CreateJobTitleInput) {
    const clash = await this.prisma.jobTitle.findFirst({
      where: { OR: [{ name: input.name }, { code: input.code }] },
      select: { id: true },
    });
    if (clash) throw new ConflictException('Job title name or code already in use');
    return this.prisma.jobTitle.create({ data: input });
  }

  async update(id: string, input: UpdateJobTitleInput) {
    await this.findOne(id);
    if (input.name || input.code) {
      const clash = await this.prisma.jobTitle.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(input.name ? [{ name: input.name }] : []),
            ...(input.code ? [{ code: input.code }] : []),
          ],
        },
        select: { id: true },
      });
      if (clash) throw new ConflictException('Job title name or code already in use');
    }
    return this.prisma.jobTitle.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.employeeProfile.count({ where: { jobTitleId: id } });
    if (inUse > 0) throw new ConflictException(`This job title is assigned to ${inUse} employee(s)`);
    await this.prisma.jobTitle.delete({ where: { id } });
    return { id };
  }
}
