import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const hashedPassword = await bcrypt.hash('admin1234', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@expo.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@expo.com',
            password: hashedPassword,
            name: '관리자',
            role: 'ADMIN',
        },
    });

    const userPassword = await bcrypt.hash('user1234', 10);

    const user = await prisma.user.upsert({
        where: { email: 'user@expo.com' },
        update: {},
        create: {
            username: 'user',
            email: 'user@expo.com',
            password: userPassword,
            name: '일반사용자',
            role: 'USER',
        },
    });

    console.log('관리자 계정 생성 완료:', admin.email);
    console.log('일반 사용자 계정 생성 완료:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
