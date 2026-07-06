import {
    Controller, Post, Body, Patch, Param, Delete, Get, Req, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, UpdateNoticeDto, ShopNoticeResponseDto, AdminNoticeListDto, ShopNoticeDetailDto } from './dto/notice.dto';
import { Auth } from '../auth/auth.decorator';

@ApiTags('공지사항 (Notice)')
@Controller('notice')
export class NoticeController {
    constructor(private readonly noticeService: NoticeService) {} 

    @Post()
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '공지사항 생성',
        description: '새로운 공지사항을 생성합니다. 관리자(ADMIN) 권한이 필요합니다. 로그인한 관리자의 ID가 작성자로 저장됩니다.',
    })
    @ApiCreatedResponse({ description: '공지사항이 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateNoticeDto })
    create(@Body() dto: CreateNoticeDto, @Req() req: Request & { user: { id: number } }) {
        return this.noticeService.create(dto, req.user.id);
    }

    @Get()
    @ApiOperation({
        summary: '공지사항 목록 조회',
        description: '전체 공지사항 목록을 조회합니다. all=true 쿼리 파라미터를 전달하면 비공개 공지사항도 포함합니다.',
    })
    @ApiOkResponse({ description: '공지사항 목록을 성공적으로 조회했습니다.' })
    @ApiQuery({
        name: 'all',
        required: false,
        type: String,
        description: '비공개 공지사항 포함 여부 (true 전달 시 전체 조회)',
        example: 'true',
    })
    async findAll(@Query('all') all?: string) {
        const data = await this.noticeService.findAll(all === 'true');
        if (all === 'true') return plainToInstance(AdminNoticeListDto, data, { excludeExtraneousValues: true });
        return plainToInstance(ShopNoticeResponseDto, data, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @ApiOperation({
        summary: '공지사항 단건 조회',
        description: '공지사항 ID로 특정 공지사항의 상세 정보를 조회합니다.',
    })
    @ApiOkResponse({ description: '공지사항 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 공지사항을 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '공지사항 ID', example: 1 })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.noticeService.findOne(id);
        return plainToInstance(ShopNoticeDetailDto, data, { excludeExtraneousValues: true });
    }

    @Patch(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '공지사항 수정',
        description: '공지사항 ID로 특정 공지사항을 수정합니다. 관리자(ADMIN) 권한이 필요합니다. 변경할 필드만 전달하면 됩니다.',
    })
    @ApiOkResponse({ description: '공지사항이 성공적으로 수정되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 공지사항을 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '공지사항 ID', example: 1 })
    @ApiBody({ type: UpdateNoticeDto })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoticeDto) {
        return this.noticeService.update(id, dto);
    }

    @Delete('bulk')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '공지사항 일괄 삭제',
        description: '여러 공지사항을 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '공지사항이 성공적으로 일괄 삭제되었습니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 공지사항 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.noticeService.removeMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '공지사항 단건 삭제',
        description: '공지사항 ID로 특정 공지사항을 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '공지사항이 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 공지사항을 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '공지사항 ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.noticeService.remove(id);
    }
}
