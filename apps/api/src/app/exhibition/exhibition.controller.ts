import { Body, Controller, Get, Param, Patch, Post, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto, UpdateExhibitionDto, ShopExhibitionResponseDto, AdminExhibitionListDto } from './dto/exhibition.dto';

@ApiTags('전시회 (Exhibition)')
@Controller('exhibition')
export class ExhibitionController {
    constructor(private readonly exhibitionService: ExhibitionService) { }

    @Post()
    @ApiOperation({
        summary: '전시회 생성',
        description: '새로운 전시회를 생성합니다. 제목, 시작일, 종료일은 필수입니다.',
    })
    @ApiCreatedResponse({ description: '전시회가 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateExhibitionDto })
    createExhibition(@Body() dto: CreateExhibitionDto){
        return this.exhibitionService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: '전시회 목록 조회',
        description: '전체 전시회 목록을 조회합니다. all=true 쿼리 파라미터를 전달하면 비공개 전시회도 포함합니다.',
    })
    @ApiOkResponse({ description: '전시회 목록을 성공적으로 조회했습니다.' })
    @ApiQuery({
        name: 'all',
        required: false,
        type: String,
        description: '비공개 전시회 포함 여부 (true 전달 시 전체 조회)',
        example: 'true',
    })
    async findAll(@Query('all') all?: string) {
        const data = await this.exhibitionService.findAll(all === 'true');
        if (all === 'true') return plainToInstance(AdminExhibitionListDto, data, { excludeExtraneousValues: true });
        return plainToInstance(ShopExhibitionResponseDto, data, { excludeExtraneousValues: true });
    }

    @Get('slim')
    @ApiOperation({
        summary: '전시회 경량 목록 조회',
        description: '필터 드롭다운용 경량 전시회 목록 (id, title만 반환)',
    })
    @ApiOkResponse({ description: '전시회 경량 목록을 성공적으로 조회했습니다.' })
    async findSlim() {
        return this.exhibitionService.findSlim();
    }

    @Get(':id')
    @ApiOperation({
        summary: '전시회 단건 조회',
        description: '전시회 ID로 특정 전시회의 상세 정보를 조회합니다. 연결된 참가업체(exhibitors) 정보도 함께 반환됩니다.',
    })
    @ApiOkResponse({ description: '전시회 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 전시회를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '전시회 ID', example: 1 })
    async findOne(@Param('id', ParseIntPipe) id: number){
        return this.exhibitionService.findOne(id);
    }
    
    @Patch(':id')
    @ApiOperation({
        summary: '전시회 수정',
        description: '전시회 ID로 특정 전시회의 정보를 수정합니다. 변경할 필드만 전달하면 됩니다 (Partial Update).',
    })
    @ApiOkResponse({ description: '전시회가 성공적으로 수정되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 전시회를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '전시회 ID', example: 1 })
    @ApiBody({ type: UpdateExhibitionDto })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExhibitionDto){
        return this.exhibitionService.update(id, dto);
    }
    
    @Delete('bulk')
    @ApiOperation({
        summary: '전시회 일괄 삭제',
        description: '여러 전시회를 한번에 삭제합니다. 삭제할 전시회 ID 배열을 전달합니다.',
    })
    @ApiOkResponse({ description: '전시회가 성공적으로 일괄 삭제되었습니다.' })
    @ApiBadRequestResponse({ description: '연결된 항목이 있어 삭제할 수 없습니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 전시회 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    async removeMany(@Body() body: { ids: number[] }) {
        return this.exhibitionService.removeMany(body.ids);
    }

    @Delete(':id')
    @ApiOperation({
        summary: '전시회 단건 삭제',
        description: '전시회 ID로 특정 전시회를 삭제합니다. 연결된 갤러리, 배너, 사전등록, 참가업체, 프로그램이 있으면 삭제가 제한됩니다.',
    })
    @ApiOkResponse({ description: '전시회가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 전시회를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '연결된 항목이 있어 삭제할 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '전시회 ID', example: 1 })
    async remove(@Param('id', ParseIntPipe) id: number){
        return this.exhibitionService.remove(id);
    }
}
