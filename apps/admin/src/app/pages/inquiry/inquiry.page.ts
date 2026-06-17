import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

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
  imports: [FormsModule, DatePipe],
  templateUrl: './inquiry.page.html'
})
export class InquiryPage {
  private http = inject(HttpClient);

  // 시그널 초기상태 정의
  inquiries = signal<Inquiry[]>([]);
  searchKeyword = signal('');
  filteredInquiries = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.inquiries();
    return this.inquiries().filter(i =>
      i.name.toLowerCase().includes(keyword) ||
      i.subject.toLowerCase().includes(keyword) ||
      i.email.toLowerCase().includes(keyword)
    );
  });
  selectedInquiry = signal<Inquiry | null>(null);
  answerText = signal('');

  constructor() {
    this.loadInquiries();
  }

  // 목록 조회
  loadInquiries() {
    this.http.get<Inquiry[]>('/api/inquiry').subscribe({
      next: (res) => this.inquiries.set(res),
      error: (err) => console.error('문의 목록 조회 실패:', err),
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
        this.loadInquiries();
        this.selectedInquiry.set(null);
        this.answerText.set('');
      },
      error: (err) => console.error('답변 작성 실패:', err),
    });
  }

  // 삭제
  deleteInquiry(id: number) {
    this.http.delete(`/api/inquiry/${id}`).subscribe({
      next: () => {
        this.loadInquiries();
        if (this.selectedInquiry()?.id === id) {
          this.selectedInquiry.set(null);
        }
      },
      error: (err) => console.error('문의 삭제 실패:', err),
    });
  }

  // 답변 취소
  cancelAnswer() {
    this.selectedInquiry.set(null);
    this.answerText.set('');
  }

  // 상태 한글 변환
  statusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return '대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '종료';
      default: return status;
    }
  }
}
