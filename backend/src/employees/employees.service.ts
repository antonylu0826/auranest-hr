import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  paginate,
  toPrismaOrderBy,
  toPrismaPage,
  type PaginationQuery,
} from '../common/pagination';
import type { CreateEmployeeInput, UpdateEmployeeInput } from './dto/employee.dto';

const SORTABLE = ['employeeNumber', 'name', 'hireDate', 'createdAt'] as const;

const SELECT = {
  id: true,
  employeeNumber: true,
  name: true,
  userId: true,
  orgUnitId: true,
  nationalId: true,
  gender: true,
  birthDate: true,
  nationality: true,
  phone: true,
  address: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  hireDate: true,
  employmentType: true,
  employmentStatus: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
} as const;

function toResponse(row: ReturnType<typeof mapRow>) {
  return row;
}

function mapRow(row: {
  id: string;
  employeeNumber: string;
  name: string;
  userId: string | null;
  orgUnitId: string | null;
  nationalId: string | null;
  gender: string | null;
  birthDate: Date | null;
  nationality: string | null;
  phone: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  hireDate: Date | null;
  employmentType: string;
  employmentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string | null; email: string } | null;
}) {
  return {
    ...row,
    birthDate: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
    hireDate: row.hireDate ? row.hireDate.toISOString().slice(0, 10) : null,
    userName: row.user?.name ?? null,
    userEmail: row.user?.email ?? null,
    user: undefined,
  };
}

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery & { status?: string }) {
    const { skip, take } = toPrismaPage(query);
    const orderBy = toPrismaOrderBy(query, SORTABLE, { employeeNumber: 'asc' });

    const where = {
      ...(query.status && { employmentStatus: query.status as never }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { employeeNumber: { contains: query.search, mode: 'insensitive' as const } },
          { phone: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.employeeProfile.findMany({ where, skip, take, orderBy, select: SELECT }),
      this.prisma.employeeProfile.count({ where }),
    ]);

    return paginate(rows.map(mapRow), total);
  }

  async findOne(id: string) {
    const row = await this.prisma.employeeProfile.findUnique({ where: { id }, select: SELECT });
    if (!row) throw new NotFoundException('Employee not found');
    return toResponse(mapRow(row));
  }

  async create(input: CreateEmployeeInput) {
    const numExists = await this.prisma.employeeProfile.findUnique({
      where: { employeeNumber: input.employeeNumber },
      select: { id: true },
    });
    if (numExists) throw new ConflictException(`Employee number ${input.employeeNumber} already taken`);

    if (input.userId) {
      const linked = await this.prisma.employeeProfile.findUnique({
        where: { userId: input.userId },
        select: { id: true },
      });
      if (linked) throw new ConflictException('This user is already linked to another employee');
    }

    const row = await this.prisma.employeeProfile.create({
      data: {
        employeeNumber: input.employeeNumber,
        name: input.name,
        userId: input.userId ?? null,
        orgUnitId: input.orgUnitId ?? null,
        nationalId: input.nationalId ?? null,
        gender: input.gender ?? null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        nationality: input.nationality ?? 'TW',
        phone: input.phone ?? null,
        address: input.address ?? null,
        emergencyContactName: input.emergencyContactName ?? null,
        emergencyContactPhone: input.emergencyContactPhone ?? null,
        hireDate: input.hireDate ? new Date(input.hireDate) : null,
        employmentType: input.employmentType ?? 'FULL_TIME',
        employmentStatus: input.employmentStatus ?? 'ACTIVE',
      },
      select: SELECT,
    });

    return toResponse(mapRow(row));
  }

  async update(id: string, input: UpdateEmployeeInput) {
    const existing = await this.prisma.employeeProfile.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) throw new NotFoundException('Employee not found');

    if (input.employeeNumber) {
      const conflict = await this.prisma.employeeProfile.findFirst({
        where: { employeeNumber: input.employeeNumber, id: { not: id } },
        select: { id: true },
      });
      if (conflict) throw new ConflictException(`Employee number ${input.employeeNumber} already taken`);
    }

    if (input.userId && input.userId !== existing.userId) {
      const conflict = await this.prisma.employeeProfile.findUnique({
        where: { userId: input.userId },
        select: { id: true },
      });
      if (conflict) throw new ConflictException('This user is already linked to another employee');
    }

    const row = await this.prisma.employeeProfile.update({
      where: { id },
      data: {
        ...(input.employeeNumber !== undefined && { employeeNumber: input.employeeNumber }),
        ...(input.name !== undefined && { name: input.name }),
        ...('userId' in input && { userId: input.userId ?? null }),
        ...('orgUnitId' in input && { orgUnitId: input.orgUnitId ?? null }),
        ...(input.nationalId !== undefined && { nationalId: input.nationalId }),
        ...(input.gender !== undefined && { gender: input.gender ?? null }),
        ...(input.birthDate !== undefined && {
          birthDate: input.birthDate ? new Date(input.birthDate) : null,
        }),
        ...(input.nationality !== undefined && { nationality: input.nationality }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.emergencyContactName !== undefined && {
          emergencyContactName: input.emergencyContactName,
        }),
        ...(input.emergencyContactPhone !== undefined && {
          emergencyContactPhone: input.emergencyContactPhone,
        }),
        ...(input.hireDate !== undefined && {
          hireDate: input.hireDate ? new Date(input.hireDate) : null,
        }),
        ...(input.employmentType !== undefined && { employmentType: input.employmentType }),
        ...(input.employmentStatus !== undefined && { employmentStatus: input.employmentStatus }),
      },
      select: SELECT,
    });

    return toResponse(mapRow(row));
  }

  async remove(id: string) {
    const existing = await this.prisma.employeeProfile.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Employee not found');
    await this.prisma.employeeProfile.delete({ where: { id } });
    return { id };
  }
}
