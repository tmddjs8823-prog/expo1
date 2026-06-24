import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Inquiry } from './inquiry.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { AppDetailFieldsComponent, DetailField } from '../../shared/detail-fields/detail-fields.component';

@Component({
  selector: 'app-inquiry-detail',
  imports: [FormsModule, AppDetailFieldsComponent, PageHeaderComponent],
  templateUrl: './inquiry-detail.page.html',
})
export class InquiryDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  private datePipe = inject(DatePipe);

  inquiryId = Number(this.route.snapshot.paramMap.get('id'));
  inquiry = signal<Inquiry | null>(null);
  answerText = signal('');

  detailFields = computed<DetailField[]>(() => {
    const inq = this.inquiry();
    if (!inq) return [];
    const fields: DetailField[] = [
      { label: '이름', value: inq.name },
      { label: '이메일', value: inq.email },
    ];
    if (inq.phone) fields.push({ label: '전화번호', value: inq.phone });
    fields.push({ label: '접수일', value: this.datePipe.transform(inq.createdAt, 'yyyy-MM-dd HH:mm') ?? '' });
    return fields;
  });

  constructor() {
    this.loadInquiry();
  }

  loadInquiry() {
    this.http.get<Inquiry>(`/api/inquiry/${this.inquiryId}`).subscribe({
      next: (res) => {
        this.inquiry.set(res);
        this.answerText.set(res.answer ?? '');
      },
      error: handleApiError(this.toast, '문의 조회 실패'),
    });
  }

  submitAnswer() {
    this.http.patch(`/api/inquiry/${this.inquiryId}/answer`, {
      answer: this.answerText(),
    }).subscribe({
      next: () => { this.toast.success('답변이 등록되었습니다.'); this.router.navigate(['/inquiry']); },
      error: handleApiError(this.toast, '답변 작성 실패'),
    });
  }

  async deleteInquiry() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/inquiry/${this.inquiryId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/inquiry']); },
      error: handleApiError(this.toast, '문의 삭제 실패'),
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
