import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-find-password',
  imports: [FormsModule, RouterModule],
  templateUrl: './find-password.page.html',
})
export class FindPasswordPage {
  Math = Math;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Step: 'form' → 'otp' → 'newpw' → 'done'
  resetStep = signal<'form' | 'otp' | 'newpw' | 'done'>('form');
  resetUsername = signal('');
  resetEmail = signal('');
  resetOtp = signal('');
  resetPassword = signal('');
  resetPasswordConfirm = signal('');
  resetError = signal('');
  resetLoading = signal(false);
  resetResendTimer = signal(0);
  resetCodeTimer = signal(0);
  private resetTimerRef: ReturnType<typeof setInterval> | null = null;
  private resetCodeTimerRef: ReturnType<typeof setInterval> | null = null;

  /** Step 1: 아이디+이메일 → OTP 발송 */
  sendResetOtp() {
    if (!this.resetUsername().trim()) { this.resetError.set('아이디를 입력해주세요.'); return; }
    const email = this.resetEmail().trim();
    if (!email || !email.includes('@')) { this.resetError.set('이메일을 입력해주세요.'); return; }

    this.resetLoading.set(true);
    this.resetError.set('');

    this.http.post<{ message: string }>('/api/auth/send-reset-password', {
      username: this.resetUsername().trim(),
      email,
    }).subscribe({
      next: () => {
        this.resetLoading.set(false);
        this.resetStep.set('otp');
        this.startResetTimer();
      },
      error: (err) => {
        this.resetLoading.set(false);
        this.resetError.set(err?.error?.message || '오류가 발생했습니다.');
      },
    });
  }

  resetResend() {
    if (this.resetResendTimer() > 0 || this.resetLoading()) return;
    this.resetOtp.set('');
    this.sendResetOtp();
  }

  private startResetTimer() {
    this.resetResendTimer.set(60);
    if (this.resetTimerRef) clearInterval(this.resetTimerRef);
    const timer = setInterval(() => {
      this.resetResendTimer.update(v => {
        if (v <= 1) { clearInterval(timer); return 0; }
        return v - 1;
      });
    }, 1000);
    this.resetTimerRef = timer;

    // 인증 코드 유효 시간 (3분 = 180초)
    this.resetCodeTimer.set(180);
    if (this.resetCodeTimerRef) clearInterval(this.resetCodeTimerRef);
    const cTimer = setInterval(() => {
      this.resetCodeTimer.update(v => {
        if (v <= 1) { clearInterval(cTimer); return 0; }
        return v - 1;
      });
    }, 1000);
    this.resetCodeTimerRef = cTimer;
  }

  /** Step 2: OTP 확인 */
  verifyResetOtp() {
    if (this.resetCodeTimer() <= 0) { this.resetError.set('인증 코드가 만료되었습니다. 재발송해주세요.'); return; }
    if (this.resetOtp().length !== 6) { this.resetError.set('6자리 코드를 입력해주세요.'); return; }

    this.resetLoading.set(true);
    this.resetError.set('');

    this.http.post<{ message: string }>('/api/auth/verify-code', {
      email: this.resetEmail(),
      code: this.resetOtp(),
      type: 'RESET_PASSWORD',
    }).subscribe({
      next: () => { this.resetLoading.set(false); this.resetStep.set('newpw'); },
      error: (err) => { this.resetLoading.set(false); this.resetError.set(err?.error?.message || '인증 코드가 올바르지 않습니다.'); },
    });
  }

  /** Step 3: 새 비밀번호 저장 */
  submitNewPassword() {
    if (this.resetPassword().length < 6) { this.resetError.set('비밀번호는 6자 이상이어야 합니다.'); return; }
    if (this.resetPassword() !== this.resetPasswordConfirm()) { this.resetError.set('비밀번호가 일치하지 않습니다.'); return; }

    this.resetLoading.set(true);
    this.resetError.set('');

    this.http.post<{ message: string }>('/api/auth/reset-password-by-code', {
      email: this.resetEmail(),
      code: this.resetOtp(),
      newPassword: this.resetPassword(),
    }).subscribe({
      next: () => { this.resetLoading.set(false); this.resetStep.set('done'); },
      error: (err) => { this.resetLoading.set(false); this.resetError.set(err?.error?.message || '비밀번호 변경에 실패했습니다.'); },
    });
  }

  kakaoLogin() {
    window.location.href = this.authService.getKakaoAuthUrl();
  }
}
