import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface FaqCategory {
  id: number;
  name: string;

}

export interface Faq {
  id: number;
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
  published: boolean;

  categoryId: number;
  category?: FaqCategory;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-faq',
  imports: [AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './faq.page.html',
})
export class FaqPage {
  private http = inject(HttpClient);
  router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  faqs = signal<Faq[]>([]);

  pg = useClientPagination({
    items: this.faqs,
    filterFn: (f, kw) =>
      f.question.toLowerCase().includes(kw) ||
      f.answer.toLowerCase().includes(kw) ||
      (f.category?.name ?? '').toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'published', label: '공개여부',
        options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
        filterFn: (f, v) => String(f.published) === v,
      },
    ],
    manualSearch: true,
    pageSize: 3,
  });

  private readonly columnDefs: ColumnDef<Faq>[] = [
    { header: '카테고리', render: (f) => f.category?.name ?? '-', truncate: true, title: (f) => f.category?.name ?? '-' },
    { header: '질문', field: 'question', truncate: true, title: (f) => f.question },
    {
      header: '상태',
      type: 'badge',
      render: (f) => f.published ? '공개' : '비공개',
      badgeClass: (f) => f.published ? 'text-green-600' : 'text-red-500',
    },
    { header: '작성일', field: 'createdAt', type: 'date' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (f) => this.deleteFaq(f.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Faq> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '질문, 답변, 카테고리로 검색',
    emptyMessage: '등록된 FAQ가 없습니다.',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.http.get<Faq[]>('/api/faq?all=true').subscribe({
      next: (res) => this.faqs.set(res),
      error: handleApiError(this.toast, 'FAQ 조회 실패'),
    });
  }

  async deleteFaq(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/faq/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadFaqs(); },
      error: handleApiError(this.toast, 'FAQ 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/faq/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadFaqs(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }
}
