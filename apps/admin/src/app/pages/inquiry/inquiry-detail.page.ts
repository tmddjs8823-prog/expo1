import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Inquiry } from './inquiry.page';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-inquiry-detail',
  imports: [FormsModule, DatePipe],
  templateUrl: './inquiry-detail.page.html',
})
export class InquiryDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);

  inquiryId = Number(this.route.snapshot.paramMap.get('id'));
  inquiry = signal<Inquiry | null>(null);
  answerText = signal('');

  constructor() {
    this.loadInquiry();
  }

  loadInquiry() {
    this.http.get<Inquiry>(`/api/inquiry/${this.inquiryId}`).subscribe({
      next: (res) => {
        this.inquiry.set(res);
        this.answerText.set(res.answer ?? '');
      },
      error: (err) => { console.error('문의 조회 실패:', err); this.toast.error('문의 조회 실패'); },
    });
  }

  submitAnswer() {
    this.http.patch(`/api/inquiry/${this.inquiryId}/answer`, {
      answer: this.answerText(),
    }).subscribe({
      next: () => { this.toast.success('답변이 등록되었습니다.'); this.router.navigate(['/inquiry']); },
      error: (err) => { console.error('답변 작성 실패:', err); this.toast.error('답변 작성 실패'); },
    });
  }

  deleteInquiry() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/inquiry/${this.inquiryId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/inquiry']); },
      error: (err) => { console.error('문의 삭제 실패:', err); this.toast.error('문의 삭제 실패'); },
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return '대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '종료';
      default: return status;
    }
  }

  goBack() {
    this.router.navigate(['/inquiry']);
  }
}
