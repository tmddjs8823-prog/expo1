import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-find-id',
  imports: [FormsModule, RouterModule],
  templateUrl: './find-id.page.html',
})
export class FindIdPage {
  Math = Math;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Step: 'form' → 'otp' → 'result'
  findStep = signal<'form' | 'otp' | 'result'>('form');
  findEmail = signal('');
  findOtp = signal('');
  findResult = signal('');
  findError = signal('');
  findLoading = signal(false);
  findResendTimer = signal(0);
  findCodeTimer = signal(0);
  private findTimerRef: ReturnType<typeof setInterval> | null = null;
  private findCodeTimerRef: ReturnType<typeof setInterval> | null = null;

  /** Step 1: 이메일 → OTP 발송 */
  findSendOtp() {
    if (!this.findEmail().trim() || !this.findEmail().includes('@')) {
      this.findError.set('이메일을 입력해주세요.');
      return;
    }

    this.findLoading.set(true);
    this.findError.set('');

    this.http.post<{ message: string }>('/api/auth/find-username/send-code', {
      email: this.findEmail().trim(),
    }).subscribe({
      next: () => {
        this.findLoading.set(false);
        this.findStep.set('otp');
        this.startFindTimer();
      },
      error: (err) => {
        this.findLoading.set(false);
        this.findError.set(err?.error?.message || '일치하는 계정이 없습니다.');
      },
    });
  }

  /** Step 2: OTP 검증 → 마스킹 아이디 반환 */
  findVerifyOtp() {
    if (this.findCodeTimer() <= 0) { this.findError.set('인증 코드가 만료되었습니다. 재발송해주세요.'); return; }
    if (this.findOtp().length !== 6) { this.findError.set('6자리 코드를 입력해주세요.'); return; }

    this.findLoading.set(true);
    this.findError.set('');

    this.http.post<{ maskedUsername: string }>('/api/auth/find-username/verify', {
      email: this.findEmail().trim(),
      code: this.findOtp(),
    }).subscribe({
      next: (res) => {
        this.findLoading.set(false);
        this.findResult.set(res.maskedUsername);
        this.findStep.set('result');
      },
      error: (err) => {
        this.findLoading.set(false);
        this.findError.set(err?.error?.message || '인증 코드가 올바르지 않습니다.');
      },
    });
  }

  findResend() {
    if (this.findResendTimer() > 0 || this.findLoading()) return;
    this.findOtp.set('');
    this.findSendOtp();
  }

  private startFindTimer() {
    this.findResendTimer.set(60);
    if (this.findTimerRef) clearInterval(this.findTimerRef);
    const timer = setInterval(() => {
      this.findResendTimer.update(v => {
        if (v <= 1) { clearInterval(timer); return 0; }
        return v - 1;
      });
    }, 1000);
    this.findTimerRef = timer;

    // 인증 코드 유효 시간 (3분 = 180초)
    this.findCodeTimer.set(180);
    if (this.findCodeTimerRef) clearInterval(this.findCodeTimerRef);
    const cTimer = setInterval(() => {
      this.findCodeTimer.update(v => {
        if (v <= 1) { clearInterval(cTimer); return 0; }
        return v - 1;
      });
    }, 1000);
    this.findCodeTimerRef = cTimer;
  }

  kakaoLogin() {
    window.location.href = this.authService.getKakaoAuthUrl();
  }

  resetFindFlow() {
    this.findStep.set('form');
    this.findOtp.set('');
    this.findResult.set('');
    this.findError.set('');
    this.findEmail.set('');
  }
}
