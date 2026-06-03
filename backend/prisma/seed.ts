import * as bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUser() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  const name = process.env.SEED_USER_NAME;

  if (!email || !password) {
    console.log('SEED_USER_EMAIL / SEED_USER_PASSWORD not set — skipping user seed.');
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.ADMIN },
    create: { email, password: hashed, name, role: UserRole.ADMIN },
  });
  console.log(`Seed user ready: ${email} (ADMIN)`);
}

async function seedOrgUnits() {
  const count = await prisma.orgUnit.count();
  if (count > 0) {
    console.log('Org units already exist — skipping org unit seed.');
    return;
  }

  // 公司層
  const company = await prisma.orgUnit.create({
    data: { name: 'AuraNest 股份有限公司', level: 'COMPANY' },
  });

  // 事業群
  const techDiv = await prisma.orgUnit.create({
    data: { name: '技術事業群', level: 'DIVISION', parentId: company.id },
  });
  const bizDiv = await prisma.orgUnit.create({
    data: { name: '業務事業群', level: 'DIVISION', parentId: company.id },
  });
  const hrDiv = await prisma.orgUnit.create({
    data: { name: '管理事業群', level: 'DIVISION', parentId: company.id },
  });

  // 部門
  const engineering = await prisma.orgUnit.create({
    data: { name: '工程部', level: 'DEPARTMENT', parentId: techDiv.id },
  });
  await prisma.orgUnit.create({
    data: { name: '產品部', level: 'DEPARTMENT', parentId: techDiv.id },
  });
  await prisma.orgUnit.create({
    data: { name: '業務部', level: 'DEPARTMENT', parentId: bizDiv.id },
  });
  await prisma.orgUnit.create({
    data: { name: '行銷部', level: 'DEPARTMENT', parentId: bizDiv.id },
  });
  await prisma.orgUnit.create({
    data: { name: '人資部', level: 'DEPARTMENT', parentId: hrDiv.id },
  });
  await prisma.orgUnit.create({
    data: { name: '財務部', level: 'DEPARTMENT', parentId: hrDiv.id },
  });

  // 小組
  await prisma.orgUnit.create({
    data: { name: '前端小組', level: 'TEAM', parentId: engineering.id },
  });
  await prisma.orgUnit.create({
    data: { name: '後端小組', level: 'TEAM', parentId: engineering.id },
  });
  await prisma.orgUnit.create({
    data: { name: 'DevOps 小組', level: 'TEAM', parentId: engineering.id },
  });

  console.log('Org units seeded: 1 company, 3 divisions, 6 departments, 3 teams');
}

async function main() {
  await seedUser();
  await seedOrgUnits();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
