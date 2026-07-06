import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, UpdateFaqDto, CreateFaqCategoryDto } from './dto/faq.dto';


    @Injectable()
    export class FaqService {
        constructor(private prisma: PrismaService) {}
    
        // 생성 (Create)
       async create(dto: CreateFaqDto) {
    const { categoryId, ...rest } = dto;
    return this.prisma.faq.create({
        data: {
            ...rest,
            category: {
                connect: { id: categoryId },
            },
        },
    });
}

        // ── 카테고리 ──

        // 카테고리 생성
        async createCategory(dto: CreateFaqCategoryDto) {
            return this.prisma.faqCategory.create({ data: dto });
        }

        // 카테고리 전체 조회
        async findAllCategories() {
            return this.prisma.faqCategory.findMany({
                select: { id: true, name: true },
                orderBy: { sortOrder: 'asc' },
            });
        }

        // 카테고리 삭제 (소속 FAQ도 함께 삭제)
        async deleteCategory(id: number) {
            await this.prisma.faq.deleteMany({ where: { categoryId: id } });
            return this.prisma.faqCategory.delete({ where: { id } });
        }
    
        // 전체 조회 (Read All)
        async findAll(includeAll = false) {
            return this.prisma.faq.findMany({
                orderBy: { updatedAt: 'desc' },
                include: { category: true },
                ...(includeAll ? {} : { where: { published: true } }),
            });
        }
    
        // 단건 조회 (Read One)
        async findOne(id: number) {
            const faq = await this.prisma.faq.findUnique({
                where: { id },
            });
    
            if (!faq) {
                throw new NotFoundException('자주묻는질문을 찾을 수 없습니다.');
            }
            return faq;
        }
    
        // 수정 (Update)
        async update(id: number, dto: UpdateFaqDto) {
            if (Object.keys(dto).length === 0) {
                throw new BadRequestException('수정할 내용이 없습니다.');
            }
    
            await this.findOne(id);
    
            return this.prisma.faq.update({
                where: { id },
                data: dto,
            });
        }
    
        // 삭제 (Delete)
        async remove(id: number) {
            await this.findOne(id);
    
            return this.prisma.faq.delete({
                where: { id },
            });
        }

        // 일괄 삭제
        async removeMany(ids: number[]) {
            return this.prisma.faq.deleteMany({ where: { id: { in: ids } } });
        }
    }
    
