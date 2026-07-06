import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    // 활성 관리자 수 조회 (보호 로직용)
    private async countActiveAdmins(): Promise<number> {
        return this.prisma.user.count({
            where: { role: 'ADMIN', status: 'ACTIVE' },
        });
    }

    // 전체 사용자 조회
    async findAll() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                status: true,
                provider: true,
                providerId: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { inquiries: true },
                },
            },
        });
    }

    // 단건 조회
    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                status: true,
                provider: true,
                providerId: true,
                createdAt: true,
                updatedAt: true,
                inquiries: {
                    select: { id: true, subject: true, status: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }
        return user;
    }

    // 역할 변경
    async updateRole(id: number, role: Role) {
        const user = await this.findOne(id);

        // 마지막 관리자의 역할을 변경하려는 경우 차단
        if (user.role === 'ADMIN' && role !== 'ADMIN') {
            const adminCount = await this.countActiveAdmins();
            if (adminCount <= 1) {
                throw new ForbiddenException('마지막 관리자의 역할은 변경할 수 없습니다.');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, name: true, role: true, status: true },
        });
    }

    // 상태 변경
    async updateStatus(id: number, status: UserStatus) {
        const user = await this.findOne(id);

        // 마지막 관리자를 정지/삭제 상태로 변경하려는 경우 차단
        if (user.role === 'ADMIN' && status !== 'ACTIVE') {
            const adminCount = await this.countActiveAdmins();
            if (adminCount <= 1) {
                throw new ForbiddenException('마지막 관리자의 상태는 변경할 수 없습니다.');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: { status },
            select: { id: true, email: true, name: true, status: true },
        });
    }

    // 삭제
    async remove(id: number) {
        const user = await this.findOne(id);

        // 관리자 삭제 시 마지막 관리자인지 확인
        if (user.role === 'ADMIN') {
            const adminCount = await this.countActiveAdmins();
            if (adminCount <= 1) {
                throw new ForbiddenException('마지막 관리자는 삭제할 수 없습니다.');
            }
        }

        // refresh token 먼저 삭제
        await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
        return this.prisma.user.delete({ where: { id } });
    }

    // 일괄 삭제
    async removeMany(ids: number[]) {
        // 삭제 대상에 관리자가 포함되어 있는지 확인
        const adminsInTarget = await this.prisma.user.count({
            where: { id: { in: ids }, role: 'ADMIN', status: 'ACTIVE' },
        });

        if (adminsInTarget > 0) {
            const totalAdmins = await this.countActiveAdmins();
            if (totalAdmins - adminsInTarget < 1) {
                throw new ForbiddenException('모든 관리자를 삭제할 수 없습니다.\n최소 1명의 관리자가 필요합니다.');
            }
        }

        await this.prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
        return this.prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
}

