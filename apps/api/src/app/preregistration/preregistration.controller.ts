import { Controller, Post, Body, Param, Delete, Get, ParseIntPipe } from '@nestjs/common';
import { Auth } from '../auth/auth.decorator'; 
import { PreregistrationService } from './preregistration.service';
import { PreregistrationDto } from './dto/preregistration.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('preregistration')
export class PreregistrationController {
    constructor(private readonly preregistrationService: PreregistrationService) {}



    //생성
    @Post()
    create(@Body() dto: PreregistrationDto) {
        return this.preregistrationService.create(dto);
    }
    
    //전체조회
    @Get()
    @Auth('ADMIN')
    findAll() {
        return this.preregistrationService.findAll();
    }
    
    //단일조회
    @Get(':id')
    @Auth('ADMIN')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.preregistrationService.findOne(id);
    }
    
    //삭제
    @Delete(':id')
    @ApiOperation({description:'사전등록을 삭제합니다.'})
    @ApiOkResponse({type: PreregistrationDto})
    @Auth('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.preregistrationService.delete(id);
    }
}
