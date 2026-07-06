import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto, UpdateGalleryDto } from './dto/gallery.dto';

@Injectable()
export class GalleryService {
    constructor(private prisma: PrismaService) {}

    // 생성
    async create(dto: CreateGalleryDto) {
        return this.prisma.gallery.create({ data: dto });
    }

    // 전체 조회
    async findAll(includeAll = false) {
        return this.prisma.gallery.findMany({
            orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
            include: { exhibition: true },
            where: includeAll ? undefined : { published: true },
        });
    }

    // 단건 조회
    async findOne(id: number) {
        const gallery = await this.prisma.gallery.findUnique({
            where: { id },
            include: { exhibition: true },
        });

        if (!gallery) {
            throw new NotFoundException('갤러리를 찾을 수 없습니다.');
        }
        return gallery;
    }

    // 수정
    async update(id: number, dto: UpdateGalleryDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('수정할 내용이 없습니다.');
        }

        await this.findOne(id);

        return this.prisma.gallery.update({
            where: { id },
            data: dto,
        });
    }

    // 삭제
    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.gallery.delete({
            where: { id },
        });
    }

    // 일괄 삭제
    async removeMany(ids: number[]) {
        return this.prisma.gallery.deleteMany({ where: { id: { in: ids } } });
    }
}
