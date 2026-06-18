import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-1" aria-label="페이지 탐색">
        <!-- 이전 -->
        <button (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() === 1"
                class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="이전 페이지">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- 페이지 번호 -->
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="w-9 h-9 flex items-center justify-center text-slate-400">…</span>
          } @else {
            <button (click)="goToPage(page)"
                    class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
                    [class.bg-primary-600]="page === currentPage()"
                    [class.text-white]="page === currentPage()"
                    [class.text-slate-700]="page !== currentPage()"
                    [class.hover:bg-slate-100]="page !== currentPage()"
                    [attr.aria-current]="page === currentPage() ? 'page' : null">
              {{ page }}
            </button>
          }
        }

        <!-- 다음 -->
        <button (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() === totalPages()"
                class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="다음 페이지">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    }
  `,
})
export class PaginationComponent {
  /** 현재 페이지 (1부터 시작) */
  currentPage = input.required<number>();
  /** 전체 페이지 수 */
  totalPages = input.required<number>();
  /** 페이지 변경 이벤트 */
  pageChange = output<number>();

  /** 표시할 페이지 번호 목록 (-1은 말줌임표) */
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    // 항상 첫 페이지
    pages.push(1);

    if (current > 3) {
      pages.push(-1); // 말줄임표
    }

    // 현재 페이지 주변
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push(-1); // 말줄임표
    }

    // 항상 마지막 페이지
    pages.push(total);

    return pages;
  });

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
