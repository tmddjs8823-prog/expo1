import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PreregistrationDto } from './dto/preregistration.dto';


@Injectable()
export class PreregistrationService {
    constructor(private prisma: PrismaService) {}
    
//사전등록 생성

    async create(dto: PreregistrationDto) {
        return this.prisma.preRegistration.create({
            data: {
                ...dto
            }, 
        });
    }
 //전체 조회

    async findAll() {
        return this.prisma.preRegistration.findMany({
            include: { exhibition: { select: { id: true, title: true } } },
            orderBy: { updatedAt: 'desc' },
        });
    }
// 단일 조회

    async findOne(id: number) {
        const reg = await this.prisma.preRegistration.findUnique({
            where: { id },
            include: { exhibition: { select: { id: true, title: true } } },
        });
        if (!reg) {
            throw new NotFoundException('사전등록을 찾을 수 없습니다.');
        }
        return reg;
    }

//삭제

    async delete(id: number) {
        await this.findOne(id);
        return this.prisma.preRegistration.delete({
            where: { id },
        });
    }


}
    

