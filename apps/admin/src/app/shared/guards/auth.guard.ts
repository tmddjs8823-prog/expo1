import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * 인증 가드 — accessToken이 없으면 refresh 시도 → 실패 시 /login으로 리다이렉트
 * 페이지 새로고침 시 메모리 토큰이 사라지므로, httpOnly 쿠키로 자동 재발급 시도
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 메모리에 토큰이 있고 관리자 권한인 경우 통과
  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  // 토큰 없거나 비관리자 상태 -> refresh 시도 (페이지 새로고침 대응)
  const newToken = await authService.refresh();
  if (newToken && authService.isAdmin()) {
    return true;
  }

  // 만약 토큰은 받아왔는데 관리자가 아니면 로그아웃 처리하여 쿠키 정리
  if (newToken && !authService.isAdmin()) {
    await authService.logout();
  }

  // 그 외에는 로그인 페이지로
  return router.createUrlTree(['/login']);
};

/**
 * 로그인 가드 — 이미 로그인된 상태에서 /login 접근 시 /dashboard로 리다이렉트
 */
export const loginGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return router.createUrlTree(['/dashboard']);
  }

  // refresh 시도
  const newToken = await authService.refresh();
  if (newToken && authService.isAdmin()) {
    return router.createUrlTree(['/dashboard']);
  }

  // 만약 토큰은 받아왔는데 관리자가 아니면 로그아웃 처리하여 쿠키 정리
  if (newToken && !authService.isAdmin()) {
    await authService.logout();
  }

  return true; // 로그인 페이지 접근 허용
};
