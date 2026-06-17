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
    async findAll() {
        return this.prisma.gallery.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }

    // 단건 조회
    async findOne(id: number) {
        const gallery = await this.prisma.gallery.findUnique({
            where: { id },
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
}
