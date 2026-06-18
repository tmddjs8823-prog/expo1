import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannerService {
    constructor(private prisma: PrismaService) {}

    // 생성
    async create(dto: CreateBannerDto) {
        return this.prisma.banner.create({ data: dto });
    }

    // 전체 조회
    async findAll() {
        return this.prisma.banner.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }

    // 단건 조회
    async findOne(id: number) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner) throw new NotFoundException('배너를 찾을 수 없습니다.');
        return banner;
    }

    // 수정
    async update(id: number, dto: UpdateBannerDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('수정할 내용이 없습니다.');
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
