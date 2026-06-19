import {
    Controller, Post, Body, Patch, Param, Delete, Get, Req, ParseIntPipe, Query,
} from '@nestjs/common';
import { Request } from 'express';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { Auth } from '../auth/auth.decorator';

@Controller('notice')
export class NoticeController {
    constructor(private readonly noticeService: NoticeService) {} 

    // 생성
    @Post()
    @Auth('ADMIN')
    create(@Body() dto: CreateNoticeDto, @Req() req: Request & { user: { id: number } }) {
        return this.noticeService.create(dto, req.user.id);
    }

    // 전체 조회 (all=true 시 비공개 포함)
    @Get()
    findAll(@Query('all') all?: string) {
        return this.noticeService.findAll(all === 'true');
    }

    // 단건 조회
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.noticeService.findOne(id);
    }

    // 수정
    @Patch(':id')
    @Auth('ADMIN')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoticeDto) {
        return this.noticeService.update(id, dto);
    }

    // 삭제
    @Delete(':id')
    @Auth('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.noticeService.remove(id);
    }
}

