import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { Auth } from '../auth/auth.decorator';
import { CreateInquiryDto, AnswerInquiryDto } from './dto/inquiry.dto';

@Controller('inquiry')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) {}

    // 문의 생성 (공개)
    @Post()
    create(@Body() dto: CreateInquiryDto) {
        return this.inquiryService.create(dto);
    }

    // 전체 조회 (관리자)
    @Get()
    @Auth('ADMIN')
    findAll() {
        return this.inquiryService.findAll();
    }

    // 단건 조회
    @Get(':id')
    @Auth('ADMIN')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.inquiryService.findOne(id);
    }

    // 답변 작성 (관리자)
    @Patch(':id/answer')
    @Auth('ADMIN')
    answer(@Param('id', ParseIntPipe) id: number, @Body() dto: AnswerInquiryDto) {
        return this.inquiryService.answer(id, dto);
    }

    // 삭제 (관리자)
    @Delete(':id')
    @Auth('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.inquiryService.remove(id);
    }
}

