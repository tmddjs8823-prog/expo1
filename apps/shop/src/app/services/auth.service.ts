import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// 중앙 인증 서비스
// - Access Token: 메모리(signal)에만 보관
// - Refresh Token: httpOnly 쿠키로 서버가 관리 (JS 접근 불가)
// - 모든 요청은 프록시(/api)를 통해 same-origin으로 전송
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // 앱 구분 헤더 (서버에서 쿠키 이름 분리에 사용)
  private readonly authHeaders = { headers: { 'X-App-Type': 'shop' } };

  // 메모리 전용 Access Token (signal로 반응형)
  private accessToken = signal<string | null>(null);

  // refresh 진행 중인 Promise (중복 요청 방지)
  private refreshPromise: Promise<string | null> | null = null;

  // 현재 Access Token 반환
  getToken(): string | null {
    return this.accessToken();
  }

  // 인증 여부 (signal 기반 → computed에서 추적 가능)
  isAuthenticated(): boolean {
    return !!this.accessToken();
  }

  // 로그인
  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ accessToken: string }>('/api/auth/login', { username, password }, this.authHeaders)
    );
    this.accessToken.set(res.accessToken);
  }

  // 회원가입 (가입 후 자동 로그인)
  async register(username: string, name: string, email: string, password: string, phone?: string, birthdate?: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ accessToken: string }>('/api/auth/register', { username, name, email, password, phone, birthdate }, this.authHeaders)
    );
    this.accessToken.set(res.accessToken);
  }

  // 카카오 소셜 로그인
  async kakaoLogin(code: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ accessToken: string }>('/api/auth/kakao', { code }, this.authHeaders)
    );
    this.accessToken.set(res.accessToken);
  }

  // 카카오 인증 URL 생성
  getKakaoAuthUrl(): string {
    const clientId = '047c8cf7f566d284c01a7a3c6c4a66a8';
    const redirectUri = encodeURIComponent('http://localhost:4300/auth/kakao/callback');
    return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  }

  // Access Token 갱신 (httpOnly 쿠키의 refresh token 사용)
  async refresh(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ accessToken: string }>('/api/auth/refresh', {}, this.authHeaders)
      );
      this.accessToken.set(res.accessToken);
      return this.accessToken();
    } catch {
      this.accessToken.set(null);
      return null;
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/auth/logout', {}, this.authHeaders));
    } catch {
      // 로그아웃 API 실패해도 클라이언트 측은 정리
    }
    this.accessToken.set(null);
    this.router.navigate(['/auth/login']);
  }
}

