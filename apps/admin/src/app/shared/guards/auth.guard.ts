import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


//인증 가드 — accessToken이 없으면 /login으로 리다이렉트
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// 로그인 가드 — 이미 로그인된 상태에서 /login 접근 시 /dashboard로 리다이렉트
export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
