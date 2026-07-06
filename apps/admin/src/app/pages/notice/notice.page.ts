import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Notice {
  id: number;
  title: string;
  createdAt: Date;
  content: string;
  published: boolean;
  isPinned: boolean;

  updatedAt: string;
  authorId: number;
}

@Component({
  selector: 'app-notice',
  imports: [AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './notice.page.html',
})
export class NoticePage {
  private http = inject(HttpClient);
  router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  notices = signal<Notice[]>([]);

  pg = useClientPagination({
    items: this.notices,
    filterFn: (n, kw) =>
      n.title.toLowerCase().includes(kw) ||
      n.content.toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'published', label: '공개여부',
        options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
        filterFn: (n, v) => String(n.published) === v,
      },
    ],
    manualSearch: true,
    pageSize: 3,
  });

  private readonly columnDefs: ColumnDef<Notice>[] = [
    { header: '제목', field: 'title', truncate: true, title: (n) => n.title },
    {
      header: '고정',
      type: 'badge',
      render: (n) => n.isPinned ? '상단고정' : '',
      badgeClass: (n) => n.isPinned ? 'text-slate-600 font-bold' : 'text-transparent',
    },
    {
      header: '공개여부',
      type: 'badge',
      render: (n) => n.published ? '공개' : '비공개',
      badgeClass: (n) => n.published ? 'text-green-600' : 'text-red-500',
    },
    { header: '작성일', field: 'createdAt', type: 'date' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (n) => this.deleteNotice(n.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Notice> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '제목, 내용으로 검색',
    emptyMessage: '등록된 공지사항이 없습니다.',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadNotice();
  }

  loadNotice() {
    this.http.get<Notice[]>('/api/notice?all=true').subscribe({
      next: (res) => this.notices.set(res),
      error: handleApiError(this.toast, '공지사항 목록 조회 실패'),
    });
  }

  async deleteNotice(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/notice/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadNotice(); },
      error: handleApiError(this.toast, '공지사항 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/notice/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadNotice(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }
}
