/**
 * Demo data — development / showcase only.
 * Run: pnpm -C backend prisma:seed-demo
 * Safe to re-run (skips if data already exists).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOrgUnits() {
  const count = await prisma.orgUnit.count();
  if (count > 0) {
    console.log('Org units already exist — skipping.');
    return;
  }

  const company = await prisma.orgUnit.create({
    data: { name: 'AuraNest 股份有限公司', level: 'COMPANY' },
  });

  const techDiv = await prisma.orgUnit.create({
    data: { name: '技術事業群', level: 'DIVISION', parentId: company.id },
  });
  const bizDiv = await prisma.orgUnit.create({
    data: { name: '業務事業群', level: 'DIVISION', parentId: company.id },
  });
  const mgmtDiv = await prisma.orgUnit.create({
    data: { name: '管理事業群', level: 'DIVISION', parentId: company.id },
  });

  const engineering = await prisma.orgUnit.create({
    data: { name: '工程部', level: 'DEPARTMENT', parentId: techDiv.id },
  });
  await prisma.orgUnit.createMany({
    data: [
      { name: '產品部', level: 'DEPARTMENT', parentId: techDiv.id },
      { name: '業務部', level: 'DEPARTMENT', parentId: bizDiv.id },
      { name: '行銷部', level: 'DEPARTMENT', parentId: bizDiv.id },
      { name: '人資部', level: 'DEPARTMENT', parentId: mgmtDiv.id },
      { name: '財務部', level: 'DEPARTMENT', parentId: mgmtDiv.id },
    ],
  });
  await prisma.orgUnit.createMany({
    data: [
      { name: '前端小組', level: 'TEAM', parentId: engineering.id },
      { name: '後端小組', level: 'TEAM', parentId: engineering.id },
      { name: 'DevOps 小組', level: 'TEAM', parentId: engineering.id },
    ],
  });

  console.log('Demo org units created: 1 company / 3 divisions / 6 departments / 3 teams');
}

async function main() {
  await seedOrgUnits();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
