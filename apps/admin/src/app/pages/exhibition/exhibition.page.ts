import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Exhibition {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  imageUrl?: string;
  linkUrl?: string;
  status: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-exhibition',
  imports: [AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './exhibition.page.html',
})
export class ExhibitionPage {
  private http = inject(HttpClient);
  router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  exhibitions = signal<Exhibition[]>([]);
  private statusOrder: Record<string, number> = { PUBLISHED: 0, DRAFT: 1, CLOSED: 2 };

  private sortedExhibitions = computed(() =>
    [...this.exhibitions()].sort((a, b) =>
      (this.statusOrder[a.status] ?? 9) - (this.statusOrder[b.status] ?? 9)
    )
  );

  private readonly statusKo: Record<string, string[]> = {
    DRAFT: ['예정'], PUBLISHED: ['진행중'], CLOSED: ['종료'],
  };

  pg = useClientPagination({
    items: this.sortedExhibitions,
    filterFn: (e, kw) =>
      e.title.toLowerCase().includes(kw) ||
      (e.venue ?? '').toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'status', label: '상태',
        options: [
          { label: '예정', value: 'DRAFT' },
          { label: '진행중', value: 'PUBLISHED' },
          { label: '종료', value: 'CLOSED' },
        ],
        filterFn: (e, v) => e.status === v,
      },
    ],
    manualSearch: true,
    pageSize: 5,
  });

  private readonly columnDefs: ColumnDef<Exhibition>[] = [
    { header: '제목', field: 'title', truncate: true, title: (e) => e.title },
    {
      header: '상태',
      type: 'badge',
      render: (e) => (this.statusKo[e.status]?.[0] ?? e.status),
      badgeClass: (e) =>
        e.status === 'PUBLISHED' ? 'text-green-600' :
        e.status === 'DRAFT' ? 'text-yellow-600' : 'text-slate-400',
    },
    { header: '장소', render: (e) => e.venue ?? '-', truncate: true, title: (e) => e.venue ?? '' },
    { header: '시작일', field: 'startDate', type: 'date' },
    { header: '종료일', field: 'endDate', type: 'date' },
    {
      header: '공개',
      type: 'badge',
      render: (e) => e.published ? '공개' : '비공개',
      badgeClass: (e) => e.published ? 'text-green-600' : 'text-red-500',
    },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (e) => this.deleteExhibition(e.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Exhibition> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '제목, 장소로 검색',
    emptyMessage: '등록된 전시회가 없습니다.',
    minWidth: '800px',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition?all=true').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  async deleteExhibition(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/exhibition/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadExhibitions(); },
      error: (err) => {
        const msg = err?.error?.message || '전시회 삭제 실패';
        this.confirmDialog.alert({
          title: '삭제 불가',
          message: msg,
          variant: 'warning',
        });
      },
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/exhibition/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadExhibitions(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }
}
