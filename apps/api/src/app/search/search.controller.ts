import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('검색 (Search)')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get()
    @ApiOperation({
        summary: '통합 검색',
        description: '키워드로 전시회, 공지사항, FAQ, 프로그램 등을 통합 검색합니다. 빈 문자열 전달 시 전체 결과를 반환합니다.',
    })
    @ApiOkResponse({
        description: '검색 결과를 성공적으로 반환했습니다.',
    })
    @ApiQuery({
        name: 'q',
        required: false,
        type: String,
        description: '검색 키워드',
        example: '박람회',
    })
    search(@Query('q') query: string) {
        return this.searchService.search(query ?? '');
    }
}
