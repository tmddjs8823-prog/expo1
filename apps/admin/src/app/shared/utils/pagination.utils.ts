import { signal, computed, Signal, WritableSignal, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// 드롭다운 필터 정의
export type FilterOption = { label: string; value: string };

export interface FilterDef<T> {
  key: string;
  label: string;
  options: FilterOption[] | Signal<FilterOption[]>;
  filterFn: (item: T, value: string) => boolean;
}

// 날짜 범위 필터 정의
export interface DateRangeFilterDef<T> {
  label: string;
  /** 아이템에서 시작일을 추출 */
  getStartDate: (item: T) => string | Date | undefined;
  /** 아이템에서 종료일을 추출 (없으면 시작일과 동일하게 취급) */
  getEndDate?: (item: T) => string | Date | undefined;
}

/**
 * 클라이언트 사이드 검색 + 필터 + 페이지네이션 유틸리티
 * — URL 쿼리 파라미터 ?page=N 으로 페이지 유지
 *
 * @example
 * ```ts
 * notices = signal<Notice[]>([]);
 *
 * pagination = useClientPagination({
 *   items: this.notices,
 *   filterFn: (n, kw) => n.title.toLowerCase().includes(kw),
 *   filterDefs: [
 *     {
 *       key: 'published', label: '공개여부',
 *       options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
 *       filterFn: (n, v) => String(n.published) === v,
 *     },
 *   ],
 *   pageSize: 10,
 * });
 * ```
 */
export function useClientPagination<T>(options: {
  //전체 아이템 시그널
  items: Signal<T[]>;
  //키워드(소문자) 기반 필터 함수
  filterFn: (item: T, keyword: string) => boolean;
  //드롭다운 필터 정의 (선택)
  filterDefs?: FilterDef<T>[];
  //날짜 범위 필터 (선택)
  dateRangeFilter?: DateRangeFilterDef<T>;
  //수동 검색 모드 (조회 버튼 클릭 시 검색)
  manualSearch?: boolean;
  //페이지 당 아이템 수 (기본 10)
  pageSize?: number;
}) {
  const route = inject(ActivatedRoute);
  const router = inject(Router);

  // URL에서 초기 페이지 번호 읽기
  const initialPage = Number(route.snapshot.queryParamMap.get('page')) || 1;

  const searchKeyword = signal('');
  // 수동 검색 모드: 조회 버튼 클릭 시에만 실제 필터링 적용
  const manualSearch = options.manualSearch ?? false;
  const appliedKeyword = signal('');
  const currentPage = signal(initialPage);
  const pageSize = options.pageSize ?? 10;

  // 드롭다운 필터 상태: { key: value } (빈 문자열 = 전체)
  const filterDefs = options.filterDefs ?? [];
  const initialFilters: Record<string, string> = {};
  for (const def of filterDefs) {
    initialFilters[def.key] = '';
  }
  const filters: WritableSignal<Record<string, string>> = signal({ ...initialFilters });

  // 날짜 범위 필터 상태
  const dateRangeFilter = options.dateRangeFilter ?? null;
  const dateFrom = signal('');
  const dateTo = signal('');

  const filtered = computed(() => {
    let result = options.items();

    // 텍스트 검색
    const kw = (manualSearch ? appliedKeyword() : searchKeyword()).toLowerCase();
    if (kw) {
      result = result.filter(item => options.filterFn(item, kw));
    }

    // 드롭다운 필터 적용
    const activeFilters = filters();
    for (const def of filterDefs) {
      const val = activeFilters[def.key];
      if (val) {
        result = result.filter(item => def.filterFn(item, val));
      }
    }

    // 날짜 범위 필터 적용
    if (dateRangeFilter) {
      const from = dateFrom();
      const to = dateTo();
      if (from || to) {
        const fromMs = from ? new Date(from).getTime() : -Infinity;
        const toMs = to ? new Date(to + 'T23:59:59').getTime() : Infinity;
        result = result.filter(item => {
          const startRaw = dateRangeFilter.getStartDate(item);
          const endRaw = dateRangeFilter.getEndDate?.(item) ?? startRaw;
          if (!startRaw) return false;
          const startMs = new Date(startRaw).getTime();
          const endMs = endRaw ? new Date(endRaw).getTime() : startMs;
          // 행사 기간이 검색 범위와 겹치면 표시
          return endMs >= fromMs && startMs <= toMs;
        });
      }
    }

    return result;
  });

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered().length / pageSize)));

  const paged = computed(() => {
    const start = (currentPage() - 1) * pageSize;
    return filtered().slice(start, start + pageSize);
  });

  // 페이지 변경 시 URL 쿼리 파라미터 업데이트
  const onPageChange = (page: number) => {
    currentPage.set(page);
    router.navigate([], {
      queryParams: {page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  };

  // 필터 값 변경 함수
  const setFilter = (key: string, value: string) => {
    filters.update(f => ({ ...f, [key]: value }));
  };

  // 모든 필터 초기화
  const resetFilters = () => {
    filters.set({ ...initialFilters });
    dateFrom.set('');
    dateTo.set('');
  };

  // 활성 필터 존재 여부
  const hasActiveFilters = computed(() => {
    const f = filters();
    const hasDropdown = Object.values(f).some(v => v !== '');
    const hasDate = dateFrom() !== '' || dateTo() !== '';
    return hasDropdown || hasDate;
  });

  // 검색어 변경 시 페이지 처리
  // — 검색 시작: 현재 페이지 기억 후 1페이지로 이동
  let prevKeyword = '';
  let savedPage = initialPage;
  effect(() => {
    const kw = searchKeyword(); // searchKeyword 만 추적
    if (kw === prevKeyword) return;

    if (prevKeyword === '' && kw !== '') {
      // 검색 시작 → 현재 페이지 기억
      savedPage = currentPage();
    }

    prevKeyword = kw;

    if (kw === '') {
      // 검색어 삭제 → 기억해둔 페이지로 복원
      const restorePage = Math.min(savedPage, totalPages());
      currentPage.set(restorePage);
      router.navigate([], {
        queryParams: { page: restorePage > 1 ? restorePage : null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      // 검색 중 → 1페이지로 초기화
      currentPage.set(1);
      router.navigate([], {
        queryParams: { page: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  });

  // 필터 변경 시 1페이지로 초기화
  let prevFiltersJson = JSON.stringify(initialFilters);
  effect(() => {
    const json = JSON.stringify(filters());
    if (json === prevFiltersJson) return;
    prevFiltersJson = json;
    currentPage.set(1);
    router.navigate([], {
      queryParams: { page: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  // 수동 검색 실행
  const applySearch = () => {
    appliedKeyword.set(searchKeyword());
    currentPage.set(1);
    router.navigate([], {
      queryParams: { page: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  };

  return {
    searchKeyword,
    currentPage,
    filtered,
    totalPages,
    paged,
    pageSize,
    onPageChange,
    filterDefs,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    dateRangeFilter,
    dateFrom,
    dateTo,
    manualSearch,
    applySearch,
  };
}

