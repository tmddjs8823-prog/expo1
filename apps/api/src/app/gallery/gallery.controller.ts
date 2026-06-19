import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { Auth } from '../auth/auth.decorator';
import { CreateGalleryDto, UpdateGalleryDto } from './dto/gallery.dto';

@Controller('gallery')
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    // 생성
    @Post()
    @Auth('ADMIN')
    create(@Body() dto: CreateGalleryDto) {
        return this.galleryService.create(dto);
    }

    // 전체 조회 (all=true 시 비공개 포함)
    @Get()
    findAll(@Query('all') all?: string) {
        return this.galleryService.findAll(all === 'true');
    }

    // 단건 조회
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.galleryService.findOne(id);
    }

    // 수정
    @Patch(':id')
    @Auth('ADMIN')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGalleryDto) {
        return this.galleryService.update(id, dto);
    }

    // 삭제
    @Delete(':id')
    @Auth('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.galleryService.remove(id);
    }
}
