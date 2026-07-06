import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) {}

    /** 6자리 랜덤 숫자 코드 생성 */
    private generateOtp(): string {
        return String(Math.floor(100000 + Math.random() * 900000));
    }

    /** OTP 저장 (기존 미사용 코드 무효화 후 새로 생성) */
    private async saveOtp(email: string, type: string): Promise<string> {
        // 기존 코드 만료 처리
        await this.prisma.emailVerification.updateMany({
            where: { email, type, used: false },
            data: { used: true },
        });

        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3분

        await this.prisma.emailVerification.create({
            data: { email, code, type, expiresAt },
        });

        return code;
    }

    /** OTP 검증 */
    async verifyEmailCode(email: string, code: string, type: string): Promise<void> {
        const record = await this.prisma.emailVerification.findFirst({
            where: { email, type, used: false },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            throw new BadRequestException('인증 코드를 먼저 발송해주세요.');
        }
        if (record.expiresAt < new Date()) {
            throw new BadRequestException('인증 코드가 만료되었습니다. 다시 발송해주세요.');
        }
        if (record.code !== code) {
            throw new BadRequestException('인증 코드가 올바르지 않습니다.');
        }

        // 사용 처리
        await this.prisma.emailVerification.update({
            where: { id: record.id },
            data: { used: true },
        });
    }

    /** 회원가입 인증코드 발송 */
    async sendRegisterVerification(email: string): Promise<void> {
        // 이미 가입된 이메일 체크
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new ConflictException('이미 사용 중인 이메일입니다.');
        }

        const code = await this.saveOtp(email, 'REGISTER');
        await this.mailService.sendVerificationCode(email, code);
    }

    /** 비밀번호 재설정 인증코드 발송 (아이디 + 이메일 검증) */
    async sendPasswordResetCode(username: string, email: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user || user.email !== email) {
            throw new UnauthorizedException('아이디 또는 이메일이 일치하지 않습니다.');
        }
        if (user.status !== 'ACTIVE') {
            throw new ForbiddenException('비활성 계정입니다.');
        }
        if (user.provider && !user.password) {
            throw new UnauthorizedException('소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.');
        }

        const code = await this.saveOtp(email, 'RESET_PASSWORD');
        await this.mailService.sendPasswordResetCode(email, code);
    }

    /** OTP 확인 후 비밀번호 변경 */
    async resetPasswordByCode(email: string, code: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

        // 기존 비밀번호와 동일한지 체크
        if (user.password) {
            const isSame = await bcrypt.compare(newPassword, user.password);
            if (isSame) {
                throw new BadRequestException('기존 비밀번호와 동일합니다. 다른 비밀번호를 입력해주세요.');
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return { message: '비밀번호가 변경되었습니다.' };
    }

    // JWT + refreshToken 발급 공통 로직
    private async issueTokens(user: { id: number; role: string; email: string }) {
        const accessToken = this.jwtService.sign({
            sub: user.id,
            role: user.role,
            email: user.email,
        });

        const refreshToken = this.jwtService.sign(
            { sub: user.id },
            { expiresIn: '7d' }
        );

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }

    async login(dto: LoginDto) {
        console.log('[Auth] login attempt:', dto.username);
        try {
            const user = await this.prisma.user.findUnique({ where: { username: dto.username } });

            if (!user)
                throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');

            // 소셜 로그인 계정은 비밀번호 로그인 불가
            if (!user.password)
                throw new UnauthorizedException('소셜 로그인으로 가입된 계정입니다. 카카오 로그인을 이용해주세요.');

            const isPasswordValid = await bcrypt.compare(dto.password, user.password);

            if (!isPasswordValid)
                throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');

            // 계정 상태 체크
            if (user.status === 'SUSPENDED')
                throw new ForbiddenException('정지된 계정입니다. 관리자에게 문의해주세요.');
            if (user.status === 'DELETED')
                throw new ForbiddenException('삭제된 계정입니다.');

            return this.issueTokens(user);
        } catch (err) {
            console.error('[Auth] login error:', err);
            throw err;
        }
    }

    async refresh(token: string) {
        const saved = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!saved || saved.expiresAt < new Date()) {
            throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
        }

        // 계정 상태 체크
        if (saved.user.status === 'SUSPENDED')
            throw new ForbiddenException('정지된 계정입니다. 관리자에게 문의해주세요.');
        if (saved.user.status === 'DELETED')
            throw new ForbiddenException('삭제된 계정입니다.');

        const accessToken = this.jwtService.sign({
            sub: saved.user.id,
            role: saved.user.role,
        });

        return { accessToken };
    }

    async logout(token: string) {
        await this.prisma.refreshToken.deleteMany({ where: { token } });
    }

    async register(dto: RegisterDto) {
        // username 중복 체크
        const existingUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (existingUsername) {
            throw new ConflictException('이미 사용 중인 아이디입니다.');
        }
        // email 중복 체크
        const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingEmail) {
            throw new ConflictException('이미 사용 중인 이메일입니다.');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                phone: dto.phone,
                birthdate: dto.birthdate,
                role: 'USER',
            },
        });

        return this.issueTokens(user);
    }

    async kakaoLogin(code: string) {
        // 1. 카카오 토큰 교환
        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID,
                client_secret: process.env.KAKAO_CLIENT_SECRET,
                redirect_uri: process.env.KAKAO_REDIRECT_URI,
                code,
            }),
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            console.error('[Auth] Kakao token error:', err);
            throw new UnauthorizedException('카카오 인증에 실패했습니다.');
        }

        const tokenData = await tokenRes.json();

        // 2. 카카오 사용자 정보 조회
        const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (!userRes.ok) {
            throw new UnauthorizedException('카카오 사용자 정보 조회에 실패했습니다.');
        }

        const kakaoUser = await userRes.json();
        const kakaoId = String(kakaoUser.id);
        const email = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@kakao.local`;
        const name = kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자';

        // 3. 기존 사용자 조회 or 신규 생성
        let user = await this.prisma.user.findFirst({
            where: { provider: 'KAKAO', providerId: kakaoId },
        });

        if (!user) {
            // 같은 이메일로 가입된 일반 계정이 있는지 확인
            const existingByEmail = await this.prisma.user.findUnique({ where: { email } });
            if (existingByEmail) {
                // 기존 계정에 카카오 연동
                user = await this.prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: { provider: 'KAKAO', providerId: kakaoId },
                });
            } else {
                // 카카오 신규 유저: username = 'kakao_' + kakaoId 로 자동 생성
                const kakaoUsername = `kakao_${kakaoId}`;
                user = await this.prisma.user.create({
                    data: {
                        username: kakaoUsername,
                        email,
                        name,
                        provider: 'KAKAO',
                        providerId: kakaoId,
                        role: 'USER',
                    },
                });
            }
        }

        // 계정 상태 체크
        if (user.status === 'SUSPENDED')
            throw new ForbiddenException('정지된 계정입니다. 관리자에게 문의해주세요.');
        if (user.status === 'DELETED')
            throw new ForbiddenException('삭제된 계정입니다.');

        return this.issueTokens(user);
    }

    // 아이디 찾기 Step1: 이메일로 계정 확인 → OTP 발송
    async findUsernameSendCode(email: string): Promise<{ message: string }> {
        const user = await this.prisma.user.findFirst({
            where: { email, status: 'ACTIVE', role: 'USER' },
            select: { id: true },
        });

        if (!user) {
            throw new UnauthorizedException('입력하신 이메일로 가입된 계정이 없습니다.');
        }

        const code = await this.saveOtp(email, 'FIND_USERNAME');
        await this.mailService.sendVerificationCode(email, code);

        return { message: '입력하신 이메일로 인증 코드를 발송했습니다.' };
    }

    // 아이디 찾기 Step2: OTP 검증 → 마스킹 username 반환
    async findUsernameVerify(email: string, code: string): Promise<{ maskedUsername: string }> {
        await this.verifyEmailCode(email, code, 'FIND_USERNAME');

        const user = await this.prisma.user.findFirst({
            where: { email, status: 'ACTIVE', role: 'USER' },
            select: { username: true },
        });

        if (!user) {
            throw new UnauthorizedException('일치하는 계정이 없습니다.');
        }

        // 마스킹 username
        const u = user.username;
        const masked = u.length <= 3
            ? u[0] + '*'.repeat(u.length - 1)
            : u.slice(0, 2) + '*'.repeat(u.length - 3) + u[u.length - 1];

        return { maskedUsername: masked };
    }
}
