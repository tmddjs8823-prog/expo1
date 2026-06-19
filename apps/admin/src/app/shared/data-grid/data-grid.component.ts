import {
  Component,
  ContentChild,
  Directive,
  inject,
  input,
  output,
  computed,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';

// ── Template 디렉티브 ──

@Directive({ selector: '[appGridHeader]' })
export class GridHeaderDef {
  readonly templateRef = inject(TemplateRef<unknown>);
}

@Directive({ selector: '[appGridRow]' })
export class GridRowDef<T> {
  readonly templateRef = inject<TemplateRef<{ $implicit: T }>>(TemplateRef);
}

// ── 컴포넌트 ──

@Component({
  selector: 'app-data-grid',
  imports: [FormsModule, NgTemplateOutlet, PaginationComponent],
  templateUrl: './data-grid.component.html',
})
export class AdminDataGridComponent<T = unknown> {
  // ── Inputs ──
  items = input.required<T[]>();
  trackByFn = input<(item: T) => unknown>(((item: Record<string, unknown>) => item?.['id']) as (item: T) => unknown);

  // 검색
  searchKeyword = input<string>('');
  searchPlaceholder = input<string>('');

  // 테이블 헤더 — 문자열 배열로 간단하게 지정 (커스텀 필요 시 appGridHeader 템플릿 사용)
  columns = input<string[]>([]);
  columnCount = input<number>(0);
  colCount = computed(() => this.columnCount() || this.columns().length || 4);

  minWidth = input<string>('700px');
  tableFixed = input<boolean>(true);
  emptyMessage = input<string>('데이터가 없습니다.');
  rowClickable = input<boolean>(false);

  // 페이지네이션 (0이면 숨김)
  currentPage = input<number>(0);
  totalPages = input<number>(0);

  // ── Outputs ──
  searchChange = output<string>();
  pageChange = output<number>();
  rowClick = output<T>();

  // ── Content Children ──
  @ContentChild(GridHeaderDef) headerTpl?: GridHeaderDef;
  @ContentChild(GridRowDef) rowTpl?: GridRowDef<T>;
}
