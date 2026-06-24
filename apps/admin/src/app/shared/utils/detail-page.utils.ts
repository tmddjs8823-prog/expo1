import { inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import { handleApiError } from './api-error.utils';

// 상세페이지 공통 유틸리티
export function useDetailPage<T>(config: {
  // API 기본 경로 (예: '/api/notice')
  apiPath: string;
  // 목록 라우트 경로 (예: '/notice')
  listRoute: string;
}) {
  const http = inject(HttpClient);
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const toast = inject(ToastService);

  const id = Number(route.snapshot.paramMap.get('id'));
  const data = signal<T | null>(null);

  // 상세 조회
  function load(onSuccess?: (res: T) => void) {
    http.get<T>(`${config.apiPath}/${id}`).subscribe({
      next: (res) => { data.set(res); onSuccess?.(res); },
      error: handleApiError(toast, '조회 실패'),
    });
  }

  // 삭제 처리
  function remove() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    http.delete(`${config.apiPath}/${id}`).subscribe({
      next: () => { toast.warning('삭제되었습니다.'); router.navigate([config.listRoute]); },
      error: handleApiError(toast, '삭제 실패'),
    });
  }

  // 수정 (PATCH) 처리
  function update(payload: Record<string, unknown>) {
    http.patch(`${config.apiPath}/${id}`, payload).subscribe({
      next: () => { toast.success('수정되었습니다.'); router.navigate([config.listRoute]); },
      error: handleApiError(toast, '수정 실패'),
    });
  }

  // 목록으로 이동
  function goBack() {
    router.navigate([config.listRoute]);
  }

  return { id, data, http, toast, router, load, remove, update, goBack };
}
