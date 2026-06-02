import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, toPrismaOrderBy, toPrismaPage, type PaginationQuery } from '../common/pagination';
import type { CreateOrgUnitInput, UpdateOrgUnitInput } from './dto/org-unit.dto';

const SORTABLE = ['name', 'level', 'createdAt'] as const;

const SELECT = {
  id: true,
  name: true,
  level: true,
  parentId: true,
  headId: true,
  parent: { select: { id: true, name: true } },
  head: { select: { id: true, name: true } },
  _count: { select: { children: true, employees: true } },
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class OrgUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { skip, take } = toPrismaPage(query);
    const orderBy = toPrismaOrderBy(query, SORTABLE, { level: 'asc', name: 'asc' });
    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : undefined;

    const [rows, total] = await Promise.all([
      this.prisma.orgUnit.findMany({ where, skip, take, orderBy, select: SELECT }),
      this.prisma.orgUnit.count({ where }),
    ]);

    return paginate(rows, total);
  }

  async getTree() {
    const all = await this.prisma.orgUnit.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        parentId: true,
        headId: true,
        head: { select: { id: true, name: true } },
        _count: { select: { employees: true } },
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });

    type Node = (typeof all)[0] & { children: Node[] };
    const map = new Map<string, Node>();
    const roots: Node[] = [];

    for (const unit of all) map.set(unit.id, { ...unit, children: [] });
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async findOne(id: string) {
    const unit = await this.prisma.orgUnit.findUnique({ where: { id }, select: SELECT });
    if (!unit) throw new NotFoundException('Org unit not found');
    return unit;
  }

  async create(input: CreateOrgUnitInput) {
    return this.prisma.orgUnit.create({
      data: {
        name: input.name,
        level: input.level,
        parentId: input.parentId ?? null,
        headId: input.headId ?? null,
      },
      select: SELECT,
    });
  }

  async update(id: string, input: UpdateOrgUnitInput) {
    await this.findOne(id);
    if (input.parentId === id) {
      throw new ConflictException('An org unit cannot be its own parent');
    }
    return this.prisma.orgUnit.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.level !== undefined && { level: input.level }),
        ...('parentId' in input && { parentId: input.parentId ?? null }),
        ...('headId' in input && { headId: input.headId ?? null }),
      },
      select: SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    const [childCount, memberCount] = await Promise.all([
      this.prisma.orgUnit.count({ where: { parentId: id } }),
      this.prisma.employeeProfile.count({ where: { orgUnitId: id } }),
    ]);
    if (childCount > 0) throw new ConflictException('Please reassign or remove child units first');
    if (memberCount > 0) throw new ConflictException('Please reassign employees before deleting this unit');
    await this.prisma.orgUnit.delete({ where: { id } });
    return { id };
  }
}
