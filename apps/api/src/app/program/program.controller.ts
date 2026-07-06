import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateProgramDto, UpdateProgramDto, ShopProgramResponseDto, AdminProgramListDto } from './dto/program.dto';
import { ProgramService } from './program.service';
import { Auth } from '../auth/auth.decorator';

@ApiTags('프로그램 (Program)')
@Controller('program')
export class ProgramController {
    constructor(private readonly programService : ProgramService) {}

    @Post()
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '프로그램 생성',
        description: '새로운 프로그램을 생성합니다. 관리자(ADMIN) 권한이 필요합니다. 제목, 시작 시간, 종료 시간은 필수입니다.',
    })
    @ApiCreatedResponse({ description: '프로그램이 성공적으로 생성되었습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiBody({ type: CreateProgramDto })
    create(@Body() dto : CreateProgramDto) {
        return this.programService.create(dto);
    }

    @Get()
    @ApiOperation({
        summary: '프로그램 목록 조회',
        description: '전체 프로그램 목록을 조회합니다. all=true 쿼리 파라미터를 전달하면 비공개 프로그램도 포함합니다.',
    })
    @ApiOkResponse({ description: '프로그램 목록을 성공적으로 조회했습니다.' })
    @ApiQuery({
        name: 'all',
        required: false,
        type: String,
        description: '비공개 프로그램 포함 여부 (true 전달 시 전체 조회)',
        example: 'true',
    })
    async findAll(@Query('all') all?: string) {
        const data = await this.programService.findAll(all === 'true');
        if (all === 'true') return plainToInstance(AdminProgramListDto, data, { excludeExtraneousValues: true });
        return plainToInstance(ShopProgramResponseDto, data, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @ApiOperation({
        summary: '프로그램 단건 조회',
        description: '프로그램 ID로 특정 프로그램의 상세 정보를 조회합니다.',
    })
    @ApiOkResponse({ description: '프로그램 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 프로그램을 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '프로그램 ID', example: 1 })
    findOne(@Param('id', ParseIntPipe) id : number) {
        return this.programService.findOne(id);
    }

    @Patch(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '프로그램 수정',
        description: '프로그램 ID로 특정 프로그램을 수정합니다. 관리자(ADMIN) 권한이 필요합니다. 변경할 필드만 전달하면 됩니다.',
    })
    @ApiOkResponse({ description: '프로그램이 성공적으로 수정되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 프로그램을 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '프로그램 ID', example: 1 })
    @ApiBody({ type: UpdateProgramDto })
    update(@Param('id', ParseIntPipe) id : number, @Body() dto : UpdateProgramDto) {
        return this.programService.update(id, dto);
    }

    @Delete('bulk')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '프로그램 일괄 삭제',
        description: '여러 프로그램을 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '프로그램이 성공적으로 일괄 삭제되었습니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 프로그램 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.programService.removeMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({
        summary: '프로그램 단건 삭제',
        description: '프로그램 ID로 특정 프로그램을 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '프로그램이 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 프로그램을 찾을 수 없습니다.' })
    @ApiParam({ name: 'id', type: Number, description: '프로그램 ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id : number) {
        return this.programService.remove(id);
    }
}
