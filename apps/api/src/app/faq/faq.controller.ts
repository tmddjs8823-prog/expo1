import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { FaqService } from './faq.service';
import { Auth } from '../auth/auth.decorator';
import { CreateFaqDto, UpdateFaqDto, CreateFaqCategoryDto } from './dto/faq.dto';

@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) {}

    // 생성
    @Post()
    @Auth('ADMIN')
    create(@Body() dto: CreateFaqDto) {
        return this.faqService.create(dto);
    }

    //전체 조회
    @Get()
    findAll() {
        return this.faqService.findAll();
    }

    // ── 카테고리 ──

    // 카테고리 생성
    @Post('category')
    @Auth('ADMIN')
    createCategory(@Body() dto: CreateFaqCategoryDto) {
        return this.faqService.createCategory(dto);
    }

    // 카테고리 전체 조회
    @Get('category')
    findAllCategories() {
        return this.faqService.findAllCategories();
    }

    // 카테고리 삭제
    @Delete('category/:id')
    @Auth('ADMIN')
    removeCategory(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.deleteCategory(id);
    }

    // 특정 조회
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.findOne(id);
    }

    // 수정
    @Patch(':id')
    @Auth('ADMIN')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
        return this.faqService.update(id, dto);
    }

    //삭제
    @Delete(':id')
    @Auth('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.remove(id);
    }
}

