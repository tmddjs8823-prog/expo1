import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { FaqService } from './faq.service';
import { Auth } from '../auth/auth.decorator';
import { CreateFaqDto, UpdateFaqDto, CreateFaqCategoryDto, ShopFaqResponseDto, AdminFaqListDto } from './dto/faq.dto';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) {}

    @Post()
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'FAQ 생성',
        description: '새로운 FAQ를 생성합니다. 관리자(ADMIN) 권한이 필요합니다. 질문, 답변, 카테고리 ID는 필수입니다.',
    })
    @ApiCreatedResponse({ description: 'FAQ가 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateFaqDto })
    create(@Body() dto: CreateFaqDto) {
        return this.faqService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: 'FAQ 목록 조회',
        description: '전체 FAQ 목록을 조회합니다. all=true 쿼리 파라미터를 전달하면 비공개 FAQ도 포함합니다.',
    })
    @ApiOkResponse({ description: 'FAQ 목록을 성공적으로 조회했습니다.' })
    @ApiQuery({
        name: 'all',
        required: false,
        type: String,
        description: '비공개 FAQ 포함 여부 (true 전달 시 전체 조회)',
        example: 'true',
    })
    async findAll(@Query('all') all?: string) {
        const data = await this.faqService.findAll(all === 'true');
        if (all === 'true') return plainToInstance(AdminFaqListDto, data, { excludeExtraneousValues: true });
        return plainToInstance(ShopFaqResponseDto, data, { excludeExtraneousValues: true });
    }

    // ── 카테고리 ──

    @Post('category')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'FAQ 카테고리 생성',
        description: '새로운 FAQ 카테고리를 생성합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiCreatedResponse({ description: 'FAQ 카테고리가 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateFaqCategoryDto })
    createCategory(@Body() dto: CreateFaqCategoryDto) {
        return this.faqService.createCategory(dto);
    }

    @Get('category')
    @ApiOperation({
        summary: 'FAQ 카테고리 전체 조회',
        description: '등록된 모든 FAQ 카테고리를 조회합니다.',
    })
    @ApiOkResponse({ description: 'FAQ 카테고리 목록을 성공적으로 조회했습니다.' })
    findAllCategories() {
        return this.faqService.findAllCategories();
    }

    @Delete('category/:id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'FAQ 카테고리 삭제',
        description: 'FAQ 카테고리 ID로 특정 카테고리를 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: 'FAQ 카테고리가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 FAQ 카테고리를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: 'FAQ 카테고리 ID', example: 1 })
    removeCategory(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.deleteCategory(id);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'FAQ 단건 조회',
        description: 'FAQ ID로 특정 FAQ의 상세 정보를 조회합니다.',
    })
    @ApiOkResponse({ description: 'FAQ 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 FAQ를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: 'FAQ ID', example: 1 })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.findOne(id);
    }

    @Patch(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'FAQ 수정',
        description: 'FAQ ID로 특정 FAQ를 수정합니다. 관리자(ADMIN) 권한이 필요합니다. 변경할 필드만 전달하면 됩니다.',
    })
    @ApiOkResponse({ description: 'FAQ가 성공적으로 수정되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 FAQ를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiParam({ name: 'id', type: Number, description: 'FAQ ID', example: 1 })
    @ApiBody({ type: UpdateFaqDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
        return this.faqService.update(id, dto);
    }

    @Delete('bulk')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'FAQ 일괄 삭제',
        description: '여러 FAQ를 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: 'FAQ가 성공적으로 일괄 삭제되었습니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 FAQ ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.faqService.removeMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'FAQ 단건 삭제',
        description: 'FAQ ID로 특정 FAQ를 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: 'FAQ가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 FAQ를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: 'FAQ ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.faqService.remove(id);
    }
}
