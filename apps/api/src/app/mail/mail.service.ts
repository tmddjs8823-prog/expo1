import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;
    private codeTemplate: string;
    private infoTemplate: string;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.naver.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,        // STARTTLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 템플릿 파일을 서버 시작 시 한 번만 로드
        const templatesDir = path.resolve(__dirname, 'templates');
        try {
            this.codeTemplate = fs.readFileSync(path.join(templatesDir, 'code-template.html'), 'utf-8');
            this.infoTemplate = fs.readFileSync(path.join(templatesDir, 'info-template.html'), 'utf-8');
        } catch {
            // dist에 복사 안 된 경우 소스에서 직접 로드
            const srcDir = path.join(process.cwd(), 'apps/api/src/app/mail/templates');
            this.codeTemplate = fs.readFileSync(path.join(srcDir, 'code-template.html'), 'utf-8');
            this.infoTemplate = fs.readFileSync(path.join(srcDir, 'info-template.html'), 'utf-8');
        }
    }

    // 회원가입 이메일 인증 코드 발송
    async sendVerificationCode(to: string, code: string): Promise<void> {
        await this.send({
            to,
            subject: '[밀리언쇼] 이메일 인증 코드',
            html: this.buildCodeTemplate({
                title: '이메일 인증',
                message: '아래 인증 코드를 입력하여 이메일을 인증해주세요.',
                code,
                note: '인증 코드는 3분간 유효합니다.',
            }),
        });
    }

    // 아이디 찾기 — 가입된 이메일 주소 발송
    async sendFoundEmail(to: string, foundEmails: string[]): Promise<void> {
        const emailList = foundEmails
            .map(e => `<li style="padding:4px 0;color:#1e293b;">${e}</li>`)
            .join('');

        await this.send({
            to,
            subject: '[밀리언쇼] 아이디(이메일) 찾기 결과',
            html: this.buildInfoTemplate({
                title: '아이디 찾기 결과',
                bodyHtml: `
                    <p style="color:#475569;margin-bottom:16px;">입력하신 이름으로 등록된 이메일은 다음과 같습니다.</p>
                    <ul style="list-style:none;padding:16px;background:#f8fafc;border-radius:8px;margin:0;">
                        ${emailList}
                    </ul>
                    <p style="color:#94a3b8;font-size:13px;margin-top:16px;">본인이 요청하지 않은 경우 이 메일을 무시해주세요.</p>
                `,
            }),
        });
    }

    // 비밀번호 재설정 OTP 코드 발송
    async sendPasswordResetCode(to: string, code: string): Promise<void> {
        await this.send({
            to,
            subject: '[밀리언쇼] 비밀번호 재설정 코드',
            html: this.buildCodeTemplate({
                title: '비밀번호 재설정',
                message: '아래 인증 코드를 입력하여 비밀번호를 재설정해주세요.',
                code,
                note: '인증 코드는 3분간 유효합니다. 본인이 요청하지 않은 경우 이 메일을 무시해주세요.',
            }),
        });
    }

    private async send(options: { to: string; subject: string; html: string }) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || `밀리언쇼 <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            this.logger.log(`Mail sent to ${options.to} | ${options.subject}`);
        } catch (err) {
            this.logger.error(`Mail send failed to ${options.to}`, err);
            throw err;
        }
    }

    private buildCodeTemplate(opts: {
        title: string;
        message: string;
        code: string;
        note: string;
    }): string {
        return this.codeTemplate
            .replace('{{title}}', opts.title)
            .replace('{{message}}', opts.message)
            .replace('{{code}}', opts.code)
            .replace('{{note}}', opts.note);
    }

    private buildInfoTemplate(opts: { title: string; bodyHtml: string }): string {
        return this.infoTemplate
            .replace('{{title}}', opts.title)
            .replace('{{bodyHtml}}', opts.bodyHtml);
    }
}
