import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto, AnswerInquiryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiryService {
    constructor(private prisma: PrismaService) {}

    // 문의 생성 (공개 - 누구나 가능)
    async create(dto: CreateInquiryDto) {
        return this.prisma.inquiry.create({ data: dto });
    }

    // 전체 조회 (관리자)
    async findAll() {
        return this.prisma.inquiry.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    // 단건 조회
    async findOne(id: number) {
        const inquiry = await this.prisma.inquiry.findUnique({
            where: { id },
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
}
