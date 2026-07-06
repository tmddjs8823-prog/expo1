import { Controller, Post, Body, Res, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

function getRefreshCookieName(req: Request): string {
  const appType = req.headers['x-app-type'];
  return appType === 'admin' ? 'refresh_token_admin' : 'refresh_token_shop';
}

@ApiTags('인증 (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인합니다. 성공 시 Access Token을 JSON으로 반환하고, Refresh Token은 httpOnly 쿠키로 설정됩니다. X-App-Type 헤더로 앱 타입(admin/shop)을 구분합니다.',
  })
  @ApiOkResponse({
    description: '로그인 성공. Access Token 반환.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT Access Token' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호가 올바르지 않습니다.' })
  @ApiBadRequestResponse({ description: '입력값이 유효하지 않습니다.' })
  @ApiHeader({ name: 'X-App-Type', required: false, description: '앱 타입 (admin 또는 shop). Refresh Token 쿠키 이름 결정에 사용.', example: 'admin' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    // Refresh Token → httpOnly 쿠키 (앱별 분리)
    res.cookie(getRefreshCookieName(req), refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    // Access Token만 JSON으로 반환
    return { accessToken };
  }

  @Post('refresh')
  @ApiOperation({
    summary: '토큰 갱신',
    description: 'httpOnly 쿠키에 저장된 Refresh Token으로 새로운 Access Token을 발급받습니다. X-App-Type 헤더로 앱 타입을 구분합니다.',
  })
  @ApiOkResponse({
    description: '토큰 갱신 성공. 새로운 Access Token 반환.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: '새로운 JWT Access Token' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '리프레시 토큰이 없거나 만료되었습니다.' })
  @ApiHeader({ name: 'X-App-Type', required: false, description: '앱 타입 (admin 또는 shop)', example: 'shop' })
  async refresh(@Req() req: Request) {
    const token = req.cookies?.[getRefreshCookieName(req)];
    if (!token) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }
    const { accessToken } = await this.authService.refresh(token);
    return { accessToken };
  }

  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃합니다. Refresh Token 쿠키를 삭제하고 서버에서 해당 토큰을 무효화합니다.',
  })
  @ApiOkResponse({
    description: '로그아웃 성공.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '로그아웃 되었습니다.' },
      },
    },
  })
  @ApiHeader({ name: 'X-App-Type', required: false, description: '앱 타입 (admin 또는 shop)', example: 'admin' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookieName = getRefreshCookieName(req);
    const token = req.cookies?.[cookieName];
    if (token) {
      await this.authService.logout(token);
    }

    // 쿠키 삭제 (앱별 분리)
    res.clearCookie(cookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return { message: '로그아웃 되었습니다.' };
  }

  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자 계정을 생성합니다. 성공 시 자동 로그인되어 Access Token을 반환하고, Refresh Token은 httpOnly 쿠키로 설정됩니다.',
  })
  @ApiOkResponse({
    description: '회원가입 성공. Access Token 반환.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT Access Token' },
      },
    },
  })
  @ApiBadRequestResponse({ description: '입력값이 유효하지 않거나 이미 존재하는 이메일입니다.' })
  @ApiHeader({ name: 'X-App-Type', required: false, description: '앱 타입 (admin 또는 shop)', example: 'shop' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(dto);

    // Refresh Token → httpOnly 쿠키 (앱별 분리)
    res.cookie(getRefreshCookieName(req), refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    // Access Token만 JSON으로 반환
    return { accessToken };
  }

  @Post('kakao')
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 OAuth 인증 코드로 로그인합니다. 성공 시 Access Token을 반환하고, Refresh Token은 httpOnly 쿠키로 설정됩니다.',
  })
  @ApiOkResponse({
    description: '카카오 로그인 성공. Access Token 반환.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT Access Token' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: '인증 코드가 없거나 유효하지 않습니다.' })
  @ApiHeader({ name: 'X-App-Type', required: false, description: '앱 타입 (admin 또는 shop)', example: 'shop' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: '카카오 OAuth 인증 코드' },
      },
      required: ['code'],
    },
  })
  async kakaoLogin(@Body('code') code: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!code) {
      throw new UnauthorizedException('인증 코드가 없습니다.');
    }

    const { accessToken, refreshToken } = await this.authService.kakaoLogin(code);

    // Refresh Token → httpOnly 쿠키 (앱별 분리)
    res.cookie(getRefreshCookieName(req), refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return { accessToken };
  }

  @Post('send-verification')
  @ApiOperation({ summary: '회원가입 이메일 인증코드 발송', description: '입력한 이메일로 6자리 인증코드를 발송합니다. (5분 유효)' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] } })
  async sendVerification(@Body('email') email: string) {
    if (!email) throw new Error('이메일을 입력해주세요.');
    await this.authService.sendRegisterVerification(email);
    return { message: '인증 코드가 발송되었습니다. 이메일을 확인해주세요.' };
  }

  @Post('verify-code')
  @ApiOperation({ summary: '이메일 인증코드 검증', description: '발송된 인증코드를 검증합니다.' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, code: { type: 'string' }, type: { type: 'string', example: 'REGISTER' } }, required: ['email', 'code', 'type'] } })
  async verifyCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('type') type: string,
  ) {
    await this.authService.verifyEmailCode(email, code, type || 'REGISTER');
    return { message: '인증이 완료되었습니다.' };
  }

  @Post('find-username/send-code')
  @ApiOperation({ summary: '아이디 찾기 Step1 - OTP 발송', description: '이메일로 계정 확인 후 OTP 발송' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] } })
  async findUsernameSendCode(
    @Body('email') email: string,
  ) {
    return this.authService.findUsernameSendCode(email);
  }

  @Post('find-username/verify')
  @ApiOperation({ summary: '아이디 찾기 Step2 - OTP 검증 후 아이디 반환', description: 'OTP 검증 후 마스킹된 아이디 반환' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, code: { type: 'string' } }, required: ['email', 'code'] } })
  async findUsernameVerify(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return this.authService.findUsernameVerify(email, code);
  }

  @Post('send-reset-password')
  @ApiOperation({ summary: '비밀번호 재설정 코드 발송', description: '아이디 + 이메일 확인 후 OTP 코드를 발송합니다.' })
  @ApiBody({ schema: { type: 'object', properties: { username: { type: 'string' }, email: { type: 'string' } }, required: ['username', 'email'] } })
  async sendResetPassword(
    @Body('username') username: string,
    @Body('email') email: string,
  ) {
    await this.authService.sendPasswordResetCode(username, email);
    return { message: '비밀번호 재설정 코드가 발송되었습니다. 이메일을 확인해주세요.' };
  }

  @Post('reset-password-by-code')
  @ApiOperation({ summary: '비밀번호 재설정 (OTP 검증)', description: '인증코드 확인 후 새 비밀번호로 변경합니다.' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, code: { type: 'string' }, newPassword: { type: 'string' } }, required: ['email', 'code', 'newPassword'] } })
  async resetPasswordByCode(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPasswordByCode(email, code, newPassword);
  }
}
