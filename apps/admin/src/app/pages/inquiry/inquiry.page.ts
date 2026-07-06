import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  subject: string;
  content: string;
  answer?: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  userId?: number;
  user?: { id: number; username: string; email: string; name: string; provider?: string };
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-inquiry',
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './inquiry.page.html'
})
export class InquiryPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  // 시그널 초기상태 정의
  inquiries = signal<Inquiry[]>([]);
  selectedInquiry = signal<Inquiry | null>(null);
  answerText = signal('');

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.inquiries,
    filterFn: (i, kw) =>
      (i.user?.username ?? '').toLowerCase().includes(kw) ||
      i.subject.toLowerCase().includes(kw) ||
      i.name.toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'status', label: '상태',
        options: [
          { label: '대기', value: 'PENDING' },
          { label: '답변완료', value: 'ANSWERED' },
          { label: '종료', value: 'CLOSED' },
        ],
        filterFn: (i, v) => i.status === v,
      },
    ],
    manualSearch: true,
    pageSize: 3,
  });

  private statusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return '대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '종료';
      default: return status;
    }
  }

  private statusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'text-blue-600';
      case 'ANSWERED': return 'text-green-600';
      case 'CLOSED': return 'text-red-500';
      default: return '';
    }
  }

  private readonly columnDefs: ColumnDef<Inquiry>[] = [
    { header: '아이디', render: (i) => i.user?.username ?? '(비회원)' },
    { header: '제목', field: 'subject' },
    {
      header: '상태',
      type: 'badge',
      render: (i) => this.statusLabel(i.status),
      badgeClass: (i) => this.statusClass(i.status),
    },
    { header: '접수일', field: 'createdAt', type: 'date' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (i) => this.deleteInquiry(i.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Inquiry> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '아이디, 제목으로 검색',
    emptyMessage: '등록된 문의가 없습니다.',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadInquiries();
  }

  // 목록 조회
  loadInquiries() {
    this.http.get<Inquiry[]>('/api/inquiry').subscribe({
      next: (res) => this.inquiries.set(res),
      error: handleApiError(this.toast, '문의 목록 조회 실패'),
    });
  }

  // 문의 선택 (상세 보기 + 답변 입력)
  selectInquiry(inquiry: Inquiry) {
    this.http.get<Inquiry>(`/api/inquiry/${inquiry.id}`).subscribe({
      next: (detail) => {
        this.selectedInquiry.set(detail);
        this.answerText.set(detail.answer ?? '');
      },
      error: handleApiError(this.toast, '문의 상세 조회 실패'),
    });
  }

  // 답변 작성
  submitAnswer() {
    const id = this.selectedInquiry()?.id;
    if (!id) return;

    this.http.patch(`/api/inquiry/${id}/answer`, {
      answer: this.answerText(),
    }).subscribe({
      next: () => {
        this.toast.success('문의이(가) 수정되었습니다.');
        this.loadInquiries();
        this.selectedInquiry.set(null);
        this.answerText.set('');
      },
      error: handleApiError(this.toast, '답변 작성 실패'),
    });
  }

  // 삭제
  async deleteInquiry(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/inquiry/${id}`).subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadInquiries();
        if (this.selectedInquiry()?.id === id) {
          this.selectedInquiry.set(null);
        }
      },
      error: handleApiError(this.toast, '문의 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/inquiry/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadInquiries(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }

  // 답변 취소
  cancelAnswer() {
    this.selectedInquiry.set(null);
    this.answerText.set('');
  }

}
