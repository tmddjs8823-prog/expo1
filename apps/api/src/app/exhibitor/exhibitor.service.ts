import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateExhibitorDto, UpdateExhibitorDto } from "./dto/exhibitor.dto";




@Injectable()
export class ExhibitorService {
   
    constructor(private readonly prisma: PrismaService) { }
    
    //전시회 부스 생성
    async create(dto: CreateExhibitorDto){
        console.log('참가업체 생성 요청 DTO:', JSON.stringify(dto));
        return this.prisma.exhibitor.create({
            data: {
                ...dto,
                exhibitionId: Number(dto.exhibitionId),
            },
        });
    }


    //전체 목록 조회
    async findAll() {
        return this.prisma.exhibitor.findMany({
            include: { exhibition: true },
            orderBy: { updatedAt: 'desc' },
        });
    }

    //단건 조회
    async findOne(id: number) {
        const exhibitor = await this.prisma.exhibitor.findUnique({ 
            where: { id },
            include: {
                exhibition: true,
            }
        });
        if (!exhibitor) throw new NotFoundException(`참가업체를 찾을 수 없습니다.`);
        return exhibitor;
    }

    //단건 수정
    async update(id: number, dto: UpdateExhibitorDto){
        await this.findOne(id);

        return this.prisma.exhibitor.update({
            where: { id },
            data: dto,
        });
    }

    //단건 삭제
    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.exhibitor.delete({ 
            where: { id } 
        });
    }

    
    
}
