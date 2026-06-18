import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExhibitionDto, UpdateExhibitionDto } from './dto/exhibition.dto';

@Injectable()
export class ExhibitionService {
    constructor(private readonly prisma: PrismaService) {}

    // 전시 목록 조회
    async findAll() {
        return this.prisma.exhibition.findMany({ orderBy: { startDate: 'desc' } });
    }

    async findOne(id: number) {
        const exhibition = await this.prisma.exhibition.findUnique({
            where: { id },
            include: { exhibitors: true }
        });
        if (!exhibition) throw new NotFoundException('전시를 찾을 수 없습니다.');
        return exhibition;
    }

    // 생성
    async create(dto: CreateExhibitionDto) {
        console.log('[Exhibition] create dto:', JSON.stringify(dto));
        try {
            return await this.prisma.exhibition.create({
                data: {
                    ...dto,
                    startDate: new Date(dto.startDate),
                    endDate: new Date(dto.endDate),
                }
            });
        } catch (err) {
            console.error('[Exhibition] create error:', err);
            throw err;
        }
    }

    // 전시 수정
    async update(id: number, dto: UpdateExhibitionDto) {
        await this.findOne(id);
        const data: Record<string, unknown> = { ...dto };
        if (dto.startDate) data.startDate = new Date(dto.startDate);
        if (dto.endDate) data.endDate = new Date(dto.endDate);
        return this.prisma.exhibition.update({
            where: { id },
            data,
        });
    }

    // 전시 삭제
    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.exhibition.delete({ where: { id } });
    }
}
