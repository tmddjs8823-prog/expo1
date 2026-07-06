import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterModule],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  Math = Math;
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // 스텝: 'terms' → 'info' → 'verify'
  step = signal<'terms' | 'info' | 'verify'>('terms');

  // ── Step 1: 약관 동의 ──
  agreeAll = signal(false);
  agreeTerms = signal(false);
  agreePrivacy = signal(false);
  agreeMarketing = signal(false);

  // ── Step 2: 정보 입력 ──
  username = signal('');
  email = signal('');
  password = signal('');
  passwordConfirm = signal('');
  name = signal('');
  birthdate = signal('');
  phone = signal('');

  // ── Step 3: OTP 인증 ──
  verifyCode = signal('');
  resendTimer = signal(0);
  codeTimer = signal(0); // 인증 코드 유효 시간 (초)
  private timerRef: ReturnType<typeof setInterval> | null = null;
  private codeTimerRef: ReturnType<typeof setInterval> | null = null;

  error = signal('');
  loading = signal(false);

  toggleAll(val: boolean) {
    this.agreeAll.set(val);
    this.agreeTerms.set(val);
    this.agreePrivacy.set(val);
    this.agreeMarketing.set(val);
  }

  onItemChange() {
    this.agreeAll.set(this.agreeTerms() && this.agreePrivacy() && this.agreeMarketing());
  }

  get requiredAgreed(): boolean {
    return this.agreeTerms() && this.agreePrivacy();
  }

  nextFromTerms() {
    if (!this.requiredAgreed) { this.error.set('필수 약관에 동의해주세요.'); return; }
    this.error.set('');
    this.step.set('info');
  }

  async sendVerification() {
    if (this.loading()) return;
    this.error.set('');

    const un = this.username().trim();
    const em = this.email().trim();

    if (!un) { this.error.set('아이디를 입력해주세요.'); return; }
    if (!/^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(un)) { this.error.set('아이디는 영문으로 시작하고 영문/숫자/밑줄(_)로 4~20자여야 합니다.'); return; }
    if (!em || !em.includes('@')) { this.error.set('올바른 이메일을 입력해주세요.'); return; }
    if (this.password().length < 6) { this.error.set('비밀번호는 6자 이상이어야 합니다.'); return; }
    if (this.password() !== this.passwordConfirm()) { this.error.set('비밀번호가 일치하지 않습니다.'); return; }
    if (!this.name().trim()) { this.error.set('이름을 입력해주세요.'); return; }
    if (!this.birthdate().trim() || this.birthdate().length < 8) { this.error.set('생년월일을 8자리로 입력해주세요. (예: 19900101)'); return; }

    this.loading.set(true);

    this.http.post<{ message: string }>('/api/auth/send-verification', { email: em }).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('verify');
        this.startResendTimer();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || '인증 코드 발송에 실패했습니다.');
      },
    });
  }

  resend() {
    if (this.resendTimer() > 0 || this.loading()) return;
    this.verifyCode.set('');
    this.sendVerification();
  }

  private startResendTimer() {
    this.resendTimer.set(60);
    if (this.timerRef) clearInterval(this.timerRef);
    const timer = setInterval(() => {
      this.resendTimer.update(v => {
        if (v <= 1) { clearInterval(timer); return 0; }
        return v - 1;
      });
    }, 1000);
    this.timerRef = timer;

    // 인증 코드 유효 시간 (3분 = 180초, 서버와 동일)
    this.codeTimer.set(180);
    if (this.codeTimerRef) clearInterval(this.codeTimerRef);
    const cTimer = setInterval(() => {
      this.codeTimer.update(v => {
        if (v <= 1) { clearInterval(cTimer); return 0; }
        return v - 1;
      });
    }, 1000);
    this.codeTimerRef = cTimer;
  }

  async verifyAndRegister() {
    if (this.loading()) return;
    if (this.codeTimer() <= 0) { this.error.set('인증 코드가 만료되었습니다. 재발송해주세요.'); return; }
    if (this.verifyCode().length !== 6) { this.error.set('6자리 인증 코드를 입력해주세요.'); return; }

    this.loading.set(true);
    this.error.set('');

    this.http.post<{ message: string }>('/api/auth/verify-code', {
      email: this.email(),
      code: this.verifyCode(),
      type: 'REGISTER',
    }).subscribe({
      next: () => this.doRegister(),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || '인증 코드가 올바르지 않습니다.');
      },
    });
  }

  private async doRegister() {
    try {
      await this.authService.register(
        this.username(),
        this.name(),
        this.email(),
        this.password(),
        this.phone() || undefined,
        this.birthdate() || undefined,
      );
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const httpErr = err as { error?: { message?: string | string[] } };
      const msg = httpErr?.error?.message;
      this.error.set(Array.isArray(msg) ? msg.join('\n') : (msg || '회원가입 중 오류가 발생했습니다.'));
      this.loading.set(false);
    }
  }

  kakaoLogin() {
    window.location.href = this.authService.getKakaoAuthUrl();
  }
}
