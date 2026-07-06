import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ExhibitorService } from "./exhibitor.service";
import { CreateExhibitorDto, UpdateExhibitorDto, AdminExhibitorListDto } from "./dto/exhibitor.dto";
import { plainToInstance } from 'class-transformer';

@ApiTags('참가업체 (Exhibitor)')
@Controller('exhibitor')
export class ExhibitorController {
    constructor(private readonly exhibitorService: ExhibitorService){}

    @Post()
    @ApiOperation({
        summary: '참가업체 등록',
        description: '새로운 참가업체를 등록합니다. 업체명과 소속 전시회 ID는 필수입니다.',
    })
    @ApiCreatedResponse({ description: '참가업체가 성공적으로 등록되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateExhibitorDto })
    async create(@Body() dto: CreateExhibitorDto) {
        return this.exhibitorService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: '참가업체 목록 조회',
        description: '전체 참가업체 목록을 조회합니다.',
    })
    @ApiOkResponse({ description: '참가업체 목록을 성공적으로 조회했습니다.' })
    async findAll(){
        const data = await this.exhibitorService.findAll();
        return plainToInstance(AdminExhibitorListDto, data, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @ApiOperation({
        summary: '참가업체 단건 조회',
        description: '참가업체 ID로 특정 참가업체의 상세 정보를 조회합니다.',
    })
    @ApiOkResponse({ description: '참가업체 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 참가업체를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '참가업체 ID', example: 1 })
    async findOne(@Param('id', ParseIntPipe) id: number){    
        return this.exhibitorService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: '참가업체 정보 수정',
        description: '참가업체 ID로 특정 참가업체의 정보를 수정합니다. 변경할 필드만 전달하면 됩니다.',
    })
    @ApiOkResponse({ description: '참가업체가 성공적으로 수정되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 참가업체를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '참가업체 ID', example: 1 })
    @ApiBody({ type: UpdateExhibitorDto })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExhibitorDto) {
        return this.exhibitorService.update(id, dto);
    }
    
    @Delete('bulk')
    @ApiOperation({
        summary: '참가업체 일괄 삭제',
        description: '여러 참가업체를 한번에 삭제합니다. 삭제할 참가업체 ID 배열을 전달합니다.',
    })
    @ApiOkResponse({ description: '참가업체가 성공적으로 일괄 삭제되었습니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 참가업체 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    async removeMany(@Body() body: { ids: number[] }) {
        return this.exhibitorService.removeMany(body.ids);
    }

    @Delete(':id')
    @ApiOperation({
        summary: '참가업체 단건 삭제',
        description: '참가업체 ID로 특정 참가업체를 삭제합니다.',
    })
    @ApiOkResponse({ description: '참가업체가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 참가업체를 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '참가업체 ID', example: 1 })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.exhibitorService.remove(id);
    }
}