import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannerService {
    constructor(private prisma: PrismaService) {}

    // 생성
    async create(dto: CreateBannerDto) {
        if (dto.linkUrl !== undefined && !dto.linkUrl?.trim()) dto.linkUrl = null;
        if (dto.subtitle !== undefined && !dto.subtitle?.trim()) dto.subtitle = null;

        // sortOrder 중복 체크
        if (dto.sortOrder !== undefined) {
            const exists = await this.prisma.banner.findFirst({ where: { sortOrder: dto.sortOrder } });
            if (exists) throw new BadRequestException(`순서 ${dto.sortOrder}번은 이미 사용 중입니다.`);
        }

        return this.prisma.banner.create({ data: dto });
    }

    // 전체 조회
    async findAll(includeAll = false) {
        return this.prisma.banner.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { exhibition: true },
            where: includeAll ? undefined : { published: true },
        });
    }

    // 단건 조회
    async findOne(id: number) {
        const banner = await this.prisma.banner.findUnique({ where: { id }, include: { exhibition: true } });
        if (!banner) throw new NotFoundException('배너를 찾을 수 없습니다.');
        return banner;
    }

    // 수정
    async update(id: number, dto: UpdateBannerDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('수정할 내용이 없습니다.');
        }
        if (dto.linkUrl !== undefined && !dto.linkUrl?.trim()) dto.linkUrl = null;
        if (dto.subtitle !== undefined && !dto.subtitle?.trim()) dto.subtitle = null;

        // sortOrder 중복 체크 (자기 자신 제외)
        if (dto.sortOrder !== undefined) {
            const exists = await this.prisma.banner.findFirst({
                where: { sortOrder: dto.sortOrder, id: { not: id } },
            });
            if (exists) throw new BadRequestException(`순서 ${dto.sortOrder}번은 이미 사용 중입니다.`);
        }

        await this.findOne(id);
        return this.prisma.banner.update({ where: { id }, data: dto });
    }

    // 삭제
    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.banner.delete({ where: { id } });
    }
}
