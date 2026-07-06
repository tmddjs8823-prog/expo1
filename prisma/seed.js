require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 현재 사용자 목록 확인
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, provider: true },
    });
    console.log('현재 사용자 목록:', users.length ? users : '(없음)');

    // admin 계정이 없으면 생성
    const admin = await prisma.user.findUnique({ where: { email: 'admin@expo.com' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@expo.com',
          password: hashedPassword,
          name: '관리자',
          role: 'ADMIN',
        },
      });
      console.log('관리자 계정 생성 완료:', { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role });
    } else {
      console.log('관리자 계정 이미 존재:', { id: admin.id, email: admin.email, role: admin.role });
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
