import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    async login(dto: LoginDto) {
        console.log('[Auth] login attempt:', dto.email);
        try {
            const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

            if (!user)
                throw new UnauthorizedException('이메일또는 비밀번호가 올바르지 않습니다.');

            const isPasswordValid = await bcrypt.compare(dto.password, user.password);

            if (!isPasswordValid)
                throw new UnauthorizedException('이메일또는 비밀번호가 올바르지 않습니다.');

            // access 토큰 발급
            const accessToken = this.jwtService.sign({
                sub: user.id,
                role: user.role,
                email: user.email,
            });

            // refresh 토큰 발급 (만료 7일)
            const refreshToken = this.jwtService.sign(
                { sub: user.id },
                { expiresIn: '7d' }
            );

            // refresh 토큰 DB 저장
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

        if (!saved || saved.expiresAt < new Date())
            throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');

        const accessToken = this.jwtService.sign({
            sub: saved.user.id,
            role: saved.user.role,
        });

        return { accessToken };
    }

    async logout(token: string) {
        await this.prisma.refreshToken.deleteMany({ where: { token } });
    }
}
