import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExhibitionDto, UpdateExhibitionDto } from './dto/exhibition.dto';

@Injectable()
export class ExhibitionService {
    constructor(private readonly prisma: PrismaService) {}

    // 전시 목록 조회
    async findAll(includeAll = false) {
        return this.prisma.exhibition.findMany({
            orderBy: { updatedAt: 'desc' },
            ...(includeAll ? {} : { where: { published: true } }),
        });
    }

    // 필터 드롭다운용 경량 조회 (종료된 전시회 제외)
    async findSlim() {
        return this.prisma.exhibition.findMany({
            select: { id: true, title: true },
            where: { status: { not: 'CLOSED' } },
            orderBy: { updatedAt: 'desc' },
        });
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
        const startDate = new Date(dto.startDate);
        const endDate   = new Date(dto.endDate);

        console.log('[Exhibition] create dto:', JSON.stringify(dto));
        try {
            return await this.prisma.exhibition.create({
                data: {
                    ...dto,
                    startDate,
                    endDate,
                },
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

        // 연결된 항목 체크
        const [galleryCount, bannerCount, preRegCount, exhibitorCount, programCount] = await Promise.all([
            this.prisma.gallery.count({ where: { exhibitionId: id } }),
            this.prisma.banner.count({ where: { exhibitionId: id } }),
            this.prisma.preRegistration.count({ where: { exhibitionId: id } }),
            this.prisma.exhibitor.count({ where: { exhibitionId: id } }),
            this.prisma.program.count({ where: { exhibitionId: id } }),
        ]);

        const linked: string[] = [];
        if (galleryCount) linked.push(`갤러리 ${galleryCount}건`);
        if (bannerCount) linked.push(`배너 ${bannerCount}건`);
        if (preRegCount) linked.push(`사전등록 ${preRegCount}건`);
        if (exhibitorCount) linked.push(`참가업체 ${exhibitorCount}건`);
        if (programCount) linked.push(`프로그램 ${programCount}건`);

        if (linked.length > 0) {
            throw new BadRequestException(
                `연결된 항목이 있어 삭제할 수 없습니다.\n${linked.join(', ')}이(가) 연결되어 있습니다. 먼저 정리해주세요.`
            );
        }

        return this.prisma.exhibition.delete({ where: { id } });
    }

    // 일괄 삭제
    async removeMany(ids: number[]) {
        return this.prisma.exhibition.deleteMany({ where: { id: { in: ids } } });
    }
}
