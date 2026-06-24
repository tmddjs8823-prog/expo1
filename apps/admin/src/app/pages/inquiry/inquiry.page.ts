import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
  answer?: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-inquiry',
  imports: [FormsModule, AdminDataGridComponent],
  templateUrl: './inquiry.page.html'
})
export class InquiryPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);

  // 시그널 초기상태 정의
  inquiries = signal<Inquiry[]>([]);
  selectedInquiry = signal<Inquiry | null>(null);
  answerText = signal('');

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.inquiries,
    filterFn: (i, kw) =>
      i.name.toLowerCase().includes(kw) ||
      i.subject.toLowerCase().includes(kw) ||
      i.email.toLowerCase().includes(kw),
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
    { header: '이름', field: 'name' },
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
    searchPlaceholder: '이름, 제목, 이메일로 검색',
    emptyMessage: '등록된 문의가 없습니다.',
    rowClickable: true,
    pagination: this.pg,
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
    this.selectedInquiry.set(inquiry);
    this.answerText.set(inquiry.answer ?? '');
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
  deleteInquiry(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
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

  // 답변 취소
  cancelAnswer() {
    this.selectedInquiry.set(null);
    this.answerText.set('');
  }

}
