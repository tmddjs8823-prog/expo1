import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
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

    //전체 전시 목록조회
    @Get()
    async findAll() {
        return this.exhibitionService.findAll();
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

