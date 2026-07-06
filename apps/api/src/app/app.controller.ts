import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('앱 (App)')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '헬스 체크',
    description: 'API 서버 상태를 확인합니다.',
  })
  @ApiOkResponse({ description: 'API 서버가 정상 작동 중입니다.' })
  getData() {
    return this.appService.getData();
  }
}
