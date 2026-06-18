import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramDto, UpdateProgramDto } from './dto/program.dto';

@Injectable()
export class ProgramService {
    constructor(private prisma:PrismaService) {}

    async create(dto: CreateProgramDto) {
        return this.prisma.program.create({
            data: {
                ...dto,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
            },
        });
    }

    async findAll() {
        return this.prisma.program.findMany({
            orderBy: { sortOrder : 'asc'},
        });
    }
    async findOne(id : number) {
        const program = await this.prisma.program.findUnique({
            where : {id},
        });
        if(!program) {
            throw new NotFoundException('프로그램을 찾을 수 없습니다.');
        }
        return program;
    }
    async update(id : number, dto : UpdateProgramDto) {
        await this.findOne(id);
        const data: Record<string, unknown> = { ...dto };
        if (dto.startTime) data.startTime = new Date(dto.startTime);
        if (dto.endTime) data.endTime = new Date(dto.endTime);
        return this.prisma.program.update({
            where : {id},
            data,
        });
    }
    async remove(id : number) {
        await this.findOne(id);
        return this.prisma.program.delete({
            where : {id},
        });
    }
}
