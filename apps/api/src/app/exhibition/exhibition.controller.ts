import { Body, Controller, Get, Param, Patch, Post, Delete, Query } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto, UpdateExhibitionDto } from './dto/exhibition.dto';

@Controller('exhibition')
export class ExhibitionController {
    constructor(private readonly exhibitionService: ExhibitionService) { }

    //전시회 생성
    @Post()
    createExhibition(@Body() dto: CreateExhibitionDto){
        return this.exhibitionService.create(dto);
    }

    //전체 전시 목록조회 (all=true 시 비공개 포함)
    @Get()
    async findAll(@Query('all') all?: string) {
        return this.exhibitionService.findAll(all === 'true');
    }

    //단건 조회
    @Get(':id')
    async findOne(@Param('id') id: string){
        return this.exhibitionService.findOne(parseInt(id));
    }
    
    //단건 수정
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateExhibitionDto){
        return this.exhibitionService.update(parseInt(id), dto);
    }
    
    //단건 삭제
    @Delete(':id')
    async remove(@Param('id') id: string){
        return this.exhibitionService.remove(parseInt(id));
    }
}

