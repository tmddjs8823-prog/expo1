import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiBody, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { InquiryService } from './inquiry.service';
import { Auth } from '../auth/auth.decorator';
import { CreateInquiryDto, AnswerInquiryDto, MyInquiryResponseDto, AdminInquiryListDto } from './dto/inquiry.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('문의 (Inquiry)')
@Controller('inquiry')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) {}

    @Post()
    @Auth()
    @ApiBearerAuth()
    @ApiOperation({
        summary: '문의 생성',
        description: '새로운 문의를 생성합니다. 로그인이 필요합니다. 로그인한 사용자의 ID가 자동으로 연결됩니다.',
    })
    @ApiCreatedResponse({ description: '문의가 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiUnauthorizedResponse({ description: '로그인이 필요합니다.' })
    @ApiBody({ type: CreateInquiryDto })
    create(@Body() dto: CreateInquiryDto, @Req() req: Request & { user?: { id: number } }) {
        const userId = req.user?.id;
        return this.inquiryService.create(dto, userId);
    }

    @Get('my')
    @Auth()
    @ApiBearerAuth()
    @ApiOperation({
        summary: '내 문의 목록 조회',
        description: '로그인한 사용자 본인의 문의 목록을 조회합니다.',
    })
    @ApiOkResponse({ description: '내 문의 목록을 성공적으로 조회했습니다.' })
    @ApiUnauthorizedResponse({ description: '로그인이 필요합니다.' })
    async findMy(@Req() req: Request & { user?: { id: number } }) {
        const userId = req.user?.id;
        const data = await this.inquiryService.findByUserId(userId);
        return plainToInstance(MyInquiryResponseDto, data, { excludeExtraneousValues: true });
    }

    @Get()
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '문의 전체 조회',
        description: '모든 문의 목록을 조회합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '문의 목록을 성공적으로 조회했습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    async findAll() {
        const data = await this.inquiryService.findAll();
        return plainToInstance(AdminInquiryListDto, data, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '문의 단건 조회',
        description: '문의 ID로 특정 문의의 상세 정보를 조회합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '문의 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 문의를 찾을 수 없습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.inquiryService.findOne(id);
    }

    @Patch(':id/answer')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '문의 답변 작성',
        description: '문의 ID로 특정 문의에 답변을 작성합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '답변이 성공적으로 작성되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 문의를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 })
    @ApiBody({ type: AnswerInquiryDto })
    answer(@Param('id', ParseIntPipe) id: number, @Body() dto: AnswerInquiryDto) {
        return this.inquiryService.answer(id, dto);
    }

    @Delete('bulk')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '문의 일괄 삭제',
        description: '여러 문의를 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '문의가 성공적으로 일괄 삭제되었습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 문의 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.inquiryService.removeMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '문의 단건 삭제',
        description: '문의 ID로 특정 문의를 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '문의가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 문의를 찾을 수 없습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.inquiryService.remove(id);
    }
}
