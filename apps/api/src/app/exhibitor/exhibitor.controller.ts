import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ExhibitorService } from "./exhibitor.service";
import { CreateExhibitorDto, UpdateExhibitionDto } from "./dto/exhibitor.dto";

@Controller('exhibitor')
export class ExhibitorController {
    constructor(private readonly exhibitorService: ExhibitorService){}

   //생성
   @Post()
   async create(@Body() dto: CreateExhibitorDto) {
    return this.exhibitorService.create(dto);
   }

   //목록 조회
   @Get()
   async findAll(){
    return this.exhibitorService.findAll();
   }
   //특정 조회
   @Get(':id')
   async findOne(@Param('id') id: string,){    
    return this.exhibitorService.findOne(parseInt(id));
    
   }

   //수정 
   @Patch(':id')
    async update(@Param('id') id: string, 
    @Body() dto: UpdateExhibitionDto) {
    return this.exhibitorService.update(parseInt(id), dto);
    }
    
   //삭제
   @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.exhibitorService.remove(parseInt(id));
    }
   
}