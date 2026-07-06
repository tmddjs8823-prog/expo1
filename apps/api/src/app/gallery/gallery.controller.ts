import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { GalleryService } from './gallery.service';
import { Auth } from '../auth/auth.decorator';
import { CreateGalleryDto, UpdateGalleryDto, ShopGalleryResponseDto, AdminGalleryListDto } from './dto/gallery.dto';


@ApiTags('갤러리 (Gallery)')
@Controller('gallery')
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    @Post()
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '갤러리 생성',
        description: '새로운 갤러리를 생성합니다. 관리자(ADMIN) 권한이 필요합니다. 제목과 이미지 URL은 필수입니다.',
    })
    @ApiCreatedResponse({ description: '갤러리가 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateGalleryDto })
    create(@Body() dto: CreateGalleryDto) {
        return this.galleryService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: '갤러리 목록 조회',
        description: '전체 갤러리 목록을 조회합니다. all=true 쿼리 파라미터를 전달하면 비공개 갤러리도 포함합니다. 응답에 전시회(exhibition) 정보가 포함됩니다.',
    })
    @ApiOkResponse({ description: '갤러리 목록을 성공적으로 조회했습니다.' })
    @ApiQuery({
        name: 'all',
        required: false,
        type: String,
        description: '비공개 갤러리 포함 여부 (true 전달 시 전체 조회)',
        example: 'true',
    })
    async findAll(@Query('all') all?: string) {
        const data = await this.galleryService.findAll(all === 'true');
        if (all === 'true') return plainToInstance(AdminGalleryListDto, data, { excludeExtraneousValues: true });
        return plainToInstance(ShopGalleryResponseDto, data, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @ApiOperation({
        summary: '갤러리 단건 조회',
        description: '갤러리 ID로 특정 갤러리의 상세 정보를 조회합니다. 연결된 전시회(exhibition) 정보도 포함됩니다.',
    })
    @ApiOkResponse({ description: '갤러리 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 갤러리를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '갤러리 ID', example: 1 })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.galleryService.findOne(id);
    }

    @Patch(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '갤러리 수정',
        description: '갤러리 ID로 특정 갤러리를 수정합니다. 관리자(ADMIN) 권한이 필요합니다. 변경할 필드만 전달하면 됩니다.',
    })
    @ApiOkResponse({ description: '갤러리가 성공적으로 수정되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 갤러리를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '수정할 내용이 없거나 입력값이 유효하지 않습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '갤러리 ID', example: 1 })
    @ApiBody({ type: UpdateGalleryDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGalleryDto) {
        return this.galleryService.update(id, dto);
    }

    @Delete('bulk')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '갤러리 일괄 삭제',
        description: '여러 갤러리를 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '갤러리가 성공적으로 일괄 삭제되었습니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 갤러리 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.galleryService.removeMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '갤러리 단건 삭제',
        description: '갤러리 ID로 특정 갤러리를 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '갤러리가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 갤러리를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '갤러리 ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.galleryService.remove(id);
    }
}
