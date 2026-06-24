import {
  Component,
  input,
  output,
  computed,
  Signal,
  WritableSignal,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';

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
  onPageChange: (page: number) => void;
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

  // Pagination-aware computed
  displayItems = computed(() => this.option().pagination?.paged() ?? this.items());
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
    if (pg) pg.searchKeyword.set(value);
    else this.searchChange.emit(value);
  }

  onPageChanged(page: number) {
    const pg = this.option().pagination;
    if (pg) pg.onPageChange(page);
    else this.pageChange.emit(page);
  }
}
