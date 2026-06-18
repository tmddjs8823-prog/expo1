import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { BannerService } from './banner.service';
import { Auth } from '../auth/auth.decorator';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Controller('banner')
export class BannerController {
    constructor(private readonly bannerService: BannerService) {}

    // 생성
    @Post()
    @Auth('ADMIN')
    create(@Body() dto: CreateBannerDto) {
        return this.bannerService.create(dto);
    }

    // 전체 조회 (공개)
    @Get()
    findAll() {
        return this.bannerService.findAll();
    }

    // 단건 조회
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.findOne(id);
    }

    // 수정
    @Patch(':id')
    @Auth('ADMIN')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
        return this.bannerService.update(id, dto);
    }

    // 삭제
    @Delete(':id')
    @Auth('ADMIN')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.remove(id);
    }
}
