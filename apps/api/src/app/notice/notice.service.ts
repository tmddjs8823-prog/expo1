import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';

@Injectable()
export class NoticeService {
    constructor(private prisma: PrismaService) {}

    // 생성 (Create)
    async create(dto: CreateNoticeDto, authorId: number) {
        return this.prisma.notice.create({
            data: {
                ...dto,
                authorId,
            },
        });
    }

    // 전체 조회 (Read All)
    async findAll(includeAll = false) {
        return this.prisma.notice.findMany({
            orderBy: { updatedAt: 'desc' },
            ...(includeAll ? {} : { where: { published: true } }),
        });
    }

    // 단건 조회 (Read One)
    async findOne(id: number) {
        const notice = await this.prisma.notice.findUnique({
            where: { id },
        });

        if (!notice) {
            throw new NotFoundException('공지사항을 찾을 수 없습니다.');
        }
        return notice;
    }

    // 수정 (Update)
    async update(id: number, dto: UpdateNoticeDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('수정할 내용이 없습니다.');
        }

        await this.findOne(id);

        return this.prisma.notice.update({
            where: { id },
            data: dto,
        });
    }

    // 삭제 (Delete)
    async remove(id: number) {
        await this.findOne(id);

        return this.prisma.notice.delete({
            where: { id },
        });
    }
}
