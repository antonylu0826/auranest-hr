import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  paginate,
  toPrismaOrderBy,
  toPrismaPage,
  type PaginationQuery,
} from '../common/pagination';
import type { CreateEmployeeDependentInput, UpdateEmployeeDependentInput } from './dto/employee-dependent.dto';

const SORTABLE = ['name', 'relationship', 'birthDate', 'createdAt'] as const;

const SELECT = {
  id: true,
  employeeId: true,
  name: true,
  relationship: true,
  gender: true,
  birthDate: true,
  nationalId: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  employee: { select: { id: true, name: true, employeeNumber: true } },
} as const;

type DependentRow = Prisma.EmployeeDependentGetPayload<{ select: typeof SELECT }>;

function mapRow(row: DependentRow) {
  return {
    ...row,
    birthDate: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
    employeeName: row.employee.name,
    employeeNumber: row.employee.employeeNumber,
    employee: undefined,
  };
}

@Injectable()
export class EmployeeDependentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery & { employeeId?: string }) {
    const { skip, take } = toPrismaPage(query);
    const orderBy = toPrismaOrderBy(query, SORTABLE, { createdAt: 'asc' });

    const where = {
      ...(query.employeeId && { employeeId: query.employeeId }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { nationalId: { contains: query.search, mode: 'insensitive' as const } },
          { phone: { contains: query.search, mode: 'insensitive' as const } },
          { employee: { name: { contains: query.search, mode: 'insensitive' as const } } },
          { employee: { employeeNumber: { contains: query.search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.employeeDependent.findMany({ where, skip, take, orderBy, select: SELECT }),
      this.prisma.employeeDependent.count({ where }),
    ]);

    return paginate(rows.map(mapRow), total);
  }

  async findOne(id: string) {
    const row = await this.prisma.employeeDependent.findUnique({ where: { id }, select: SELECT });
    if (!row) throw new NotFoundException('Dependent not found');
    return mapRow(row);
  }

  async create(input: CreateEmployeeDependentInput) {
    const employee = await this.prisma.employeeProfile.findUnique({
      where: { id: input.employeeId },
      select: { id: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const row = await this.prisma.employeeDependent.create({
      data: {
        employeeId: input.employeeId,
        name: input.name,
        relationship: input.relationship,
        gender: input.gender ?? null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        nationalId: input.nationalId ?? null,
        phone: input.phone ?? null,
        isActive: input.isActive ?? true,
      },
      select: SELECT,
    });

    return mapRow(row);
  }

  async update(id: string, input: UpdateEmployeeDependentInput) {
    const existing = await this.prisma.employeeDependent.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Dependent not found');

    if (input.employeeId) {
      const employee = await this.prisma.employeeProfile.findUnique({
        where: { id: input.employeeId },
        select: { id: true },
      });
      if (!employee) throw new NotFoundException('Employee not found');
    }

    const row = await this.prisma.employeeDependent.update({
      where: { id },
      data: {
        ...(input.employeeId !== undefined && { employeeId: input.employeeId }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.relationship !== undefined && { relationship: input.relationship }),
        ...(input.gender !== undefined && { gender: input.gender ?? null }),
        ...(input.birthDate !== undefined && {
          birthDate: input.birthDate ? new Date(input.birthDate) : null,
        }),
        ...(input.nationalId !== undefined && { nationalId: input.nationalId ?? null }),
        ...(input.phone !== undefined && { phone: input.phone ?? null }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      select: SELECT,
    });

    return mapRow(row);
  }

  async remove(id: string) {
    const existing = await this.prisma.employeeDependent.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Dependent not found');
    await this.prisma.employeeDependent.delete({ where: { id } });
    return { id };
  }
}
