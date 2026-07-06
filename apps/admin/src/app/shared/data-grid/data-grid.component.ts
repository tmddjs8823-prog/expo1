import {
  Component,
  input,
  output,
  computed,
  signal,
  effect,
  Signal,
  WritableSignal,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';
import { FilterDef, FilterOption, DateRangeFilterDef } from '../utils/pagination.utils';
import { isSignal } from '@angular/core';

// 컬럼 정의

export type ColumnAction<T> = {
  label: string;
  class?: string;
  stopPropagation?: boolean; // 기본 true
  onClick: (item: T, event: MouseEvent) => void;
};

export type ColumnDef<T> = {
  header: string;
  field?: keyof T;
  type?: 'text' | 'date' | 'image' | 'badge';
  dateFormat?: string;       // date 타입 전용 (기본: 'yy-MM-dd')
  truncate?: boolean;
  title?: (item: T) => string; // td [title] tooltip
  render?: (item: T) => string;
  badgeClass?: (item: T) => string;
  imageClass?: string;       // image 타입 전용 (기본: 'w-16 h-16 object-cover rounded')
  actions?: ColumnAction<T>[];
};

// Pagination 인터페이스

export interface DataGridPagination<T = unknown> {
  searchKeyword: WritableSignal<string>;
  currentPage: Signal<number>;
  totalPages: Signal<number>;
  paged: Signal<T[]>;
  filtered: Signal<T[]>;
  onPageChange: (page: number) => void;
  // 필터 관련 (선택)
  filterDefs?: FilterDef<T>[];
  filters?: WritableSignal<Record<string, string>>;
  setFilter?: (key: string, value: string) => void;
  resetFilters?: () => void;
  hasActiveFilters?: Signal<boolean>;
  // 날짜 범위 필터 (선택)
  dateRangeFilter?: DateRangeFilterDef<T> | null;
  dateFrom?: WritableSignal<string>;
  dateTo?: WritableSignal<string>;
  // 수동 검색 (선택)
  manualSearch?: boolean;
  applySearch?: () => void;
}

// Option 인터페이스

export interface DataGridOption<T = unknown> {
  // 컬럼 정의 (columnDefs 우선, 없으면 columns 헤더만)
  columnDefs?: ColumnDef<T>[];
  // 테이블 헤더 컬럼명 (columnDefs 미사용 시)
  columns?: string[];
  // 컬럼 수 (columns 미지정 시 직접 지정)
  columnCount?: number;
  // 검색 placeholder (비어있으면 검색 UI 숨김)
  searchPlaceholder?: string;
  // 테이블 최소 너비
  minWidth?: string;
  // table-layout: fixed 여부
  tableFixed?: boolean;
  // 데이터 없을 때 메시지
  emptyMessage?: string;
  // 행 클릭 가능 여부
  rowClickable?: boolean;
  // trackBy 함수
  trackByFn?: (item: T) => unknown;
  // useClientPagination 반환 객체 — 검색 · 페이지네이션 자동 처리
  pagination?: DataGridPagination<T>;
  // 로딩 상태 — true면 스켈레톤 표시
  loading?: boolean;
  // 일괄 작업 (체크박스 선택 활성화)
  bulkActions?: {
    label: string;
    class?: string;
    onClick: (selectedIds: unknown[]) => void;
  };
}

// 날짜 포맷 파이프 (컴포넌트 내부용)

@Pipe({ name: 'gridDate' })
export class GridDatePipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');
  transform(value: unknown, format = 'yy-MM-dd'): string {
    if (!value) return '-';
    return this.datePipe.transform(value as string, format) ?? '-';
  }
}

// 컴포넌트

@Component({
  selector: 'app-data-grid',
  imports: [FormsModule, PaginationComponent, GridDatePipe],
  templateUrl: './data-grid.component.html',
})
export class AdminDataGridComponent<T = unknown> {
  // Fallback inputs (pagination 미사용 시)
  items = input<T[]>([]);
  searchKeyword = input<string>('');
  currentPage = input<number>(0);
  totalPages = input<number>(0);

  // Outputs
  searchChange = output<string>();
  pageChange = output<number>();
  rowClick = output<T>();

  // 설정
  option = input<DataGridOption<T>>({});

  // Computed (option에서 파생)
  trackByFn = computed(() => this.option().trackByFn ?? ((item: Record<string, unknown>) => item?.['id']) as (item: T) => unknown);
  columnDefs = computed(() => this.option().columnDefs ?? []);
  columns = computed(() => {
    const defs = this.columnDefs();
    return defs.length ? defs.map(d => d.header) : (this.option().columns ?? []);
  });
  colCount = computed(() => this.option().columnCount || this.columns().length || 4);
  minWidth = computed(() => this.option().minWidth ?? '700px');
  tableFixed = computed(() => this.option().tableFixed ?? true);
  emptyMessage = computed(() => this.option().emptyMessage ?? '데이터가 없습니다.');
  rowClickable = computed(() => this.option().rowClickable ?? false);
  searchPlaceholder = computed(() => this.option().searchPlaceholder ?? '');
  loading = computed(() => this.option().loading ?? false);

  // 필터 관련 computed
  filterDefs = computed(() => this.option().pagination?.filterDefs ?? []);
  filters = computed(() => this.option().pagination?.filters?.() ?? {});
  hasActiveFilters = computed(() => this.option().pagination?.hasActiveFilters?.() ?? false);

  // 날짜 범위 필터 computed
  displayDateRangeFilter = computed(() => this.option().pagination?.dateRangeFilter?.label ?? '');
  displayDateFrom = computed(() => this.option().pagination?.dateFrom?.() ?? '');
  displayDateTo = computed(() => this.option().pagination?.dateTo?.() ?? '');

  // 수동 검색 모드
  isManualSearch = computed(() => this.option().pagination?.manualSearch ?? false);

  // Pagination-aware computed
  displayItems = computed(() => this.option().pagination?.paged() ?? this.items());
  displayFilteredCount = computed(() => this.option().pagination?.filtered()?.length ?? this.items().length);
  displaySearchKeyword = computed(() => this.option().pagination?.searchKeyword() ?? this.searchKeyword());
  displayCurrentPage = computed(() => this.option().pagination?.currentPage() ?? this.currentPage());
  displayTotalPages = computed(() => this.option().pagination?.totalPages() ?? this.totalPages());

  // 셀 값 추출
  getCellValue(item: T, col: ColumnDef<T>): unknown {
    if (col.render) return col.render(item);
    if (col.field != null) return (item as Record<string, unknown>)[col.field as string];
    return '';
  }

  // 액션 클릭
  onActionClick(action: ColumnAction<T>, item: T, event: MouseEvent) {
    if (action.stopPropagation !== false) event.stopPropagation();
    action.onClick(item, event);
  }

  // 검색/페이지 이벤트
  onSearchChange(value: string) {
    const pg = this.option().pagination;
    if (pg) {
      pg.searchKeyword.set(value);
      // 수동 검색 모드에서 검색어가 비면 자동으로 검색 적용 (1페이지 초기화)
      if (pg.manualSearch && value === '') {
        pg.applySearch?.();
      }
    } else {
      this.searchChange.emit(value);
    }
  }

  onPageChanged(page: number) {
    const pg = this.option().pagination;
    if (pg) pg.onPageChange(page);
    else this.pageChange.emit(page);
  }

  // 필터 이벤트
  onFilterChange(key: string, value: string) {
    this.option().pagination?.setFilter?.(key, value);
  }

  onResetFilters() {
    this.option().pagination?.resetFilters?.();
  }

  // 날짜 범위 필터 이벤트
  onDateFromChange(value: string) {
    this.option().pagination?.dateFrom?.set(value);
  }

  onDateToChange(value: string) {
    this.option().pagination?.dateTo?.set(value);
  }

  // 수동 검색 실행
  onApplySearch() {
    this.option().pagination?.applySearch?.();
  }

  // FilterDef.options가 Signal일 수 있으므로 resolve
  resolveOptions(options: FilterOption[] | Signal<FilterOption[]>): FilterOption[] {
    return isSignal(options) ? options() : options;
  }

  // ── 체크박스 선택 (일괄 작업) ──

  hasBulkActions = computed(() => !!this.option().bulkActions);
  selectedIds = signal<Set<unknown>>(new Set());
  selectedCount = computed(() => this.selectedIds().size);

  allSelected = computed(() => {
    const items = this.displayItems();
    if (items.length === 0) return false;
    const sel = this.selectedIds();
    return items.every(item => sel.has(this.trackByFn()(item)));
  });

  constructor() {
    // 페이지 변경 시 선택 초기화
    effect(() => {
      this.displayCurrentPage(); // 페이지 변경 추적
      this.selectedIds.set(new Set());
    });
  }

  toggleSelect(item: T) {
    const id = this.trackByFn()(item);
    this.selectedIds.update(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isSelected(item: T): boolean {
    return this.selectedIds().has(this.trackByFn()(item));
  }

  toggleAll() {
    const items = this.displayItems();
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      const ids = new Set(items.map(item => this.trackByFn()(item)));
      this.selectedIds.set(ids);
    }
  }

  onBulkAction() {
    const bulk = this.option().bulkActions;
    if (bulk) {
      bulk.onClick([...this.selectedIds()]);
      this.selectedIds.set(new Set());
    }
  }
}
