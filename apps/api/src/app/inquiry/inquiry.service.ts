import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto, AnswerInquiryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiryService {
    constructor(private prisma: PrismaService) {}

    // 문의 생성 (로그인 사용자 - name/email 자동 채움)
    async create(dto: CreateInquiryDto, userId?: number) {
        let name: string | null = dto.name || null;
        let email: string | null = dto.email || null;

        // 로그인 유저면 DB에서 이름/이메일 가져오기
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, email: true },
            });
            if (user) {
                name = name || user.name;
                email = email || user.email;
            }
        }

        return this.prisma.inquiry.create({
            data: {
                subject: dto.subject,
                content: dto.content,
                name,
                email,
                userId: userId ?? null,
            },
        });
    }

    // 전체 조회 (관리자)
    async findAll() {
        return this.prisma.inquiry.findMany({
            orderBy: { updatedAt: 'desc' },
            include: { user: { select: { id: true, username: true, email: true, name: true, provider: true } } },
        });
    }

    // 내 문의 조회 (사용자)
    async findByUserId(userId?: number) {
        console.log('[Inquiry] findByUserId called with userId:', userId);
        if (!userId) return [];
        const result = await this.prisma.inquiry.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                subject: true,
                content: true,
                answer: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.log('[Inquiry] findByUserId result count:', result.length);
        return result;
    }

    // 단건 조회
    async findOne(id: number) {
        const inquiry = await this.prisma.inquiry.findUnique({
            where: { id },
            include: { user: { select: { id: true, username: true, email: true, name: true, provider: true } } },
        });

        if (!inquiry) {
            throw new NotFoundException('문의를 찾을 수 없습니다.');
        }
        return inquiry;
    }

    // 답변 작성 (관리자)
    async answer(id: number, dto: AnswerInquiryDto) {
        await this.findOne(id);

        return this.prisma.inquiry.update({
            where: { id },
            data: {
                answer: dto.answer,
                status: 'ANSWERED',
            },
        });
    }

    // 삭제
    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.inquiry.delete({
            where: { id },
        });
    }

    // 일괄 삭제
    async removeMany(ids: number[]) {
        return this.prisma.inquiry.deleteMany({ where: { id: { in: ids } } });
    }
}
