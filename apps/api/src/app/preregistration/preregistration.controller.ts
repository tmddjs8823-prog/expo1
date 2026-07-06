import { Controller, Post, Body, Param, Delete, Get, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiBody, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator'; 
import { PreregistrationService } from './preregistration.service';
import { PreregistrationDto, AdminPreregListDto } from './dto/preregistration.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('사전등록 (Pre-registration)')
@Controller('preregistration')
export class PreregistrationController {
    constructor(private readonly preregistrationService: PreregistrationService) {}

    @Post()
    @ApiOperation({
        summary: '사전등록 신청',
        description: '박람회 사전등록을 신청합니다. 이름, 이메일, 이용약관 동의는 필수입니다.',
    })
    @ApiCreatedResponse({ description: '사전등록이 성공적으로 완료되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: PreregistrationDto })
    create(@Body() dto: PreregistrationDto) {
        return this.preregistrationService.create(dto);
    }
    
    @Get()
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '사전등록 전체 조회',
        description: '모든 사전등록 목록을 조회합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사전등록 목록을 성공적으로 조회했습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    async findAll() {
        const data = await this.preregistrationService.findAll();
        return plainToInstance(AdminPreregListDto, data, { excludeExtraneousValues: true });
    }
    
    @Get(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '사전등록 단건 조회',
        description: '사전등록 ID로 특정 사전등록의 상세 정보를 조회합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사전등록 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 사전등록을 찾을 수 없습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '사전등록 ID', example: 1 })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.preregistrationService.findOne(id);
    }
    
    @Delete('bulk')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '사전등록 일괄 삭제',
        description: '여러 사전등록을 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사전등록이 성공적으로 일괄 삭제되었습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 사전등록 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.preregistrationService.deleteMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '사전등록 단건 삭제',
        description: '사전등록 ID로 특정 사전등록을 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사전등록이 성공적으로 삭제되었습니다.', type: PreregistrationDto })
    @ApiNotFoundResponse({ description: '해당 ID의 사전등록을 찾을 수 없습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '사전등록 ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.preregistrationService.delete(id);
    }
}
