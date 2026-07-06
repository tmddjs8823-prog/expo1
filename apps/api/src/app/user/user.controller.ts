import { Controller, Get, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBearerAuth, ApiParam, ApiBody, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Auth } from '../auth/auth.decorator';
import { Role, UserStatus } from '@prisma/client';
import { AdminUserListDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('사용자 관리 (User)')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @Auth('ADMIN')
    @ApiOperation({
        summary: '사용자 전체 조회',
        description: '모든 사용자 목록을 조회합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사용자 목록을 성공적으로 조회했습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    async findAll() {
        const data = await this.userService.findAll();
        return plainToInstance(AdminUserListDto, data, { excludeExtraneousValues: true });
    }

    @Get(':id')
    @Auth('ADMIN')
    @ApiOperation({
        summary: '사용자 단건 조회',
        description: '사용자 ID로 특정 사용자의 상세 정보를 조회합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사용자 상세 정보를 성공적으로 조회했습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 사용자를 찾을 수 없습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '사용자 ID', example: 1 })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    @Patch(':id/role')
    @Auth('ADMIN')
    @ApiOperation({
        summary: '사용자 역할 변경',
        description: '사용자의 역할을 변경합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사용자 역할이 성공적으로 변경되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 사용자를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '유효하지 않은 역할입니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '사용자 ID', example: 1 })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    description: '변경할 역할',
                    example: 'ADMIN',
                },
            },
            required: ['role'],
        },
    })
    updateRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: Role) {
        return this.userService.updateRole(id, role);
    }

    @Patch(':id/status')
    @Auth('ADMIN')
    @ApiOperation({
        summary: '사용자 상태 변경',
        description: '사용자의 계정 상태를 변경합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사용자 상태가 성공적으로 변경되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 사용자를 찾을 수 없습니다.' })
    @ApiBadRequestResponse({ description: '유효하지 않은 상태입니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '사용자 ID', example: 1 })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['ACTIVE', 'SUSPENDED', 'WITHDRAWN'],
                    description: '변경할 계정 상태',
                    example: 'SUSPENDED',
                },
            },
            required: ['status'],
        },
    })
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: UserStatus) {
        return this.userService.updateStatus(id, status);
    }

    @Delete('bulk')
    @Auth('ADMIN')
    @ApiOperation({
        summary: '사용자 일괄 삭제',
        description: '여러 사용자를 한번에 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사용자가 성공적으로 일괄 삭제되었습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: { type: 'number' },
                    description: '삭제할 사용자 ID 배열',
                    example: [1, 2, 3],
                },
            },
            required: ['ids'],
        },
    })
    removeMany(@Body() body: { ids: number[] }) {
        return this.userService.removeMany(body.ids);
    }

    @Delete(':id')
    @Auth('ADMIN')
    @ApiOperation({
        summary: '사용자 단건 삭제',
        description: '사용자 ID로 특정 사용자를 삭제합니다. 관리자(ADMIN) 권한이 필요합니다.',
    })
    @ApiOkResponse({ description: '사용자가 성공적으로 삭제되었습니다.' })
    @ApiNotFoundResponse({ description: '해당 ID의 사용자를 찾을 수 없습니다.' })
    @ApiUnauthorizedResponse({ description: '관리자 권한이 필요합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '사용자 ID', example: 1 })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}
