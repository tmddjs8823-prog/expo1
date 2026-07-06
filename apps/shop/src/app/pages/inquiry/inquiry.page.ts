import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shop-inquiry',
  imports: [FormsModule, RouterModule],
  templateUrl: './inquiry.page.html',
})
export class InquiryPage {
  private http = inject(HttpClient);

  // 폼 필드 (제목 + 내용만)
  subject = '';
  content = '';

  // 상태
  submitting = signal(false);
  submitted = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.subject.trim()) {
      this.errorMessage.set('제목을 입력해주세요.');
      return;
    }
    if (!this.content.trim()) {
      this.errorMessage.set('내용을 입력해주세요.');
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);

    this.http.post('/api/inquiry', {
      subject: this.subject.trim(),
      content: this.content.trim(),
    }).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('문의 접수 실패:', err);
        const msg = err.error?.message;
        this.errorMessage.set(
          Array.isArray(msg) ? msg.join('\n') : (msg || '접수 중 오류가 발생했습니다. 다시 시도해주세요.')
        );
        this.submitting.set(false);
      },
    });
  }
}
