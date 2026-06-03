import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, toPrismaOrderBy, toPrismaPage, type PaginationQuery } from '../common/pagination';
import type { CreateShiftTypeInput, UpdateShiftTypeInput } from './dto/shift-type.dto';

const SORTABLE = ['name', 'code', 'category', 'isActive', 'createdAt'] as const;

@Injectable()
export class ShiftTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { skip, take } = toPrismaPage(query);
    const orderBy = toPrismaOrderBy(query, SORTABLE, { name: 'asc' });
    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { code: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [rows, total] = await Promise.all([
      this.prisma.shiftType.findMany({ where, skip, take, orderBy }),
      this.prisma.shiftType.count({ where }),
    ]);
    return paginate(rows, total);
  }

  async findOne(id: string) {
    const found = await this.prisma.shiftType.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Shift type not found');
    return found;
  }

  async create(input: CreateShiftTypeInput) {
    const clash = await this.prisma.shiftType.findFirst({
      where: { OR: [{ name: input.name }, { code: input.code }] },
      select: { id: true },
    });
    if (clash) throw new ConflictException('Shift type name or code already in use');

    const { cycleAnchorDate, ...rest } = input;
    return this.prisma.shiftType.create({
      data: {
        ...rest,
        category: rest.category ?? 'FIXED',
        cycleAnchorDate: cycleAnchorDate ? new Date(cycleAnchorDate) : null,
      },
    });
  }

  async update(id: string, input: UpdateShiftTypeInput) {
    await this.findOne(id);
    const { cycleAnchorDate, ...rest } = input;
    return this.prisma.shiftType.update({
      where: { id },
      data: {
        ...rest,
        ...(cycleAnchorDate !== undefined && {
          cycleAnchorDate: cycleAnchorDate ? new Date(cycleAnchorDate) : null,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.employeeProfile.count({ where: { shiftTypeId: id } });
    if (inUse > 0) throw new ConflictException(`This shift type is assigned to ${inUse} employee(s)`);
    await this.prisma.shiftType.delete({ where: { id } });
    return { id };
  }
}
