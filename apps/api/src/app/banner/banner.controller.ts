import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { BannerService } from './banner.service';
import { Auth } from '../auth/auth.decorator';
import { CreateBannerDto, UpdateBannerDto, ShopBannerResponseDto, AdminBannerListDto } from './dto/banner.dto';

@ApiTags('배너 (Banner)')
@Controller('banner')
export class BannerController {
    constructor(private readonly bannerService: BannerService) {}

    @Post()
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '배너 생성',
        description: '새로운 배너를 생성합니다. 관리자(ADMIN) 권한이 필요합니다. 제목과 이미지 URL은 필수입니다.',
    })
    @ApiCreatedResponse({ description: '배너가 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateBannerDto })
    create(@Body() dto: CreateBannerDto) {
        return this.bannerService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: '배너 목록 조회',
        description: '전체 배너 목록을 조회합니다. all=true 쿼리 파라미터를 전달하면 비공개 배너도 포함합니다.',
    })
    @ApiOkResponse({ description: '배너 목록을 성공적으로 조회했습니다.' })
    @ApiQuery({
        name: 'all',
        required: false,
        type: String,
        description: '비공개 배너 포함 여부 (true 전달 시 전체 조회)',
        example: 'true',
    })
    async findAll(@Query('all') all?: string) {
        const data = await this.bannerService.findAll(all === 'true');
        if (all === 'true') return plainToInstance(AdminBannerListDto, data, { excludeExtraneousValues: true });
        return plainToInstance(ShopBannerResponseDto, data, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @ApiOperation({
        summary: '배너 단건 조회',
        description: '배너 ID로 특정 배너의 상세 정보를 조회합니다.',
    })
    @ApiOkResponse({ description: '배너 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 배너를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '배너 ID', example: 1 })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.findOne(id);
    }

    @Patch(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '배너 수정',
        description: '배너 ID로 특정 배너를 수정합니다. 관리자(ADMIN) 권한이 필요합니다. 변경할 필드만 전달하면 됩니다.',
    })
    @ApiOkResponse({ description: '배너가 성공적으로 수정되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 배너를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '배너 ID', example: 1 })
    @ApiBody({ type: UpdateBannerDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
        return this.bannerService.update(id, dto);
    }

    @Delete('bulk')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '배너 일괄 삭제',
        description: '여러 배너를 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '배너가 성공적으로 일괄 삭제되었습니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 배너 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.bannerService.removeMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '배너 단건 삭제',
        description: '배너 ID로 특정 배너를 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '배너가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 배너를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '배너 ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.remove(id);
    }
}
