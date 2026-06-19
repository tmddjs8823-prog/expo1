import { signal, computed, Signal } from '@angular/core';

/**
 * 클라이언트 사이드 검색 + 페이지네이션 유틸리티
 *
 * @example
 * ```ts
 * notices = signal<Notice[]>([]);
 *
 * pagination = useClientPagination({
 *   items: this.notices,
 *   filterFn: (n, kw) => n.title.toLowerCase().includes(kw),
 *   pageSize: 10,
 * });
 *
 * // Template:
 * // pagination.paged()      → 현재 페이지 아이템
 * // pagination.searchKeyword() / pagination.searchKeyword.set(...)
 * // pagination.currentPage() / pagination.onPageChange(n)
 * // pagination.totalPages()
 * ```
 */
export function useClientPagination<T>(options: {
  /** 전체 아이템 시그널 */
  items: Signal<T[]>;
  /** 키워드(소문자) 기반 필터 함수 */
  filterFn: (item: T, keyword: string) => boolean;
  /** 페이지 당 아이템 수 (기본 10) */
  pageSize?: number;
}) {
  const searchKeyword = signal('');
  const currentPage = signal(1);
  const pageSize = options.pageSize ?? 10;

  const filtered = computed(() => {
    const kw = searchKeyword().toLowerCase();
    if (!kw) return options.items();
    return options.items().filter(item => options.filterFn(item, kw));
  });

  const totalPages = computed(() => Math.ceil(filtered().length / pageSize));

  const paged = computed(() => {
    const start = (currentPage() - 1) * pageSize;
    return filtered().slice(start, start + pageSize);
  });

  const onPageChange = (page: number) => currentPage.set(page);

  return {
    searchKeyword,
    currentPage,
    filtered,
    totalPages,
    paged,
    pageSize,
    onPageChange,
  };
}
