import { Signal, signal, computed, WritableSignal } from '@angular/core';

export interface PaginationResult<T> {
  currentPage: WritableSignal<number>;
  totalPages: Signal<number>;
  pagedItems: Signal<T[]>;
  goToPage: (page: number) => void;
}

// 페이지네이션 로직을 캡슐화하는 유틸리티 함수
export function usePagination<T>(source: Signal<T[]>, pageSize: number): PaginationResult<T> {
  const currentPage = signal(1);
  const totalPages = computed(() => Math.ceil(source().length / pageSize));
  const pagedItems = computed(() => {
    const start = (currentPage() - 1) * pageSize;
    return source().slice(start, start + pageSize);
  });
  const goToPage = (page: number) => {
    currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return { currentPage, totalPages, pagedItems, goToPage };
}
