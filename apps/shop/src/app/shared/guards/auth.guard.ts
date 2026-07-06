import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// 인증 가드 — accessToken이 없으면 refresh 시도 → 실패 시 /auth/login으로 리다이렉트
// 페이지 새로고침 시 메모리 토큰이 사라지므로, httpOnly 쿠키로 자동 재발급 시도
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 메모리에 토큰이 있으면 통과
  if (authService.isAuthenticated()) {
    return true;
  }

  // 토큰 없음 → refresh 시도 (페이지 새로고침 대응)
  const newToken = await authService.refresh();
  if (newToken) {
    return true;
  }

  // refresh 실패 → 로그인 페이지로
  return router.createUrlTree(['/auth/login']);
};

// 로그인 가드 — 이미 로그인된 상태에서 /auth/login 접근 시 홈으로 리다이렉트
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // 로그인 상태 → 홈으로 리다이렉트
    return router.createUrlTree(['/']);
  }

  // 비로그인 상태 → 로그인 페이지 접근 허용
  return true;
};
