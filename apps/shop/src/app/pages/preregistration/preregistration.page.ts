import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-preregistration',
  imports: [FormsModule, RouterModule],
  templateUrl: './preregistration.page.html',
})
export class PreregistrationPage {
  private http = inject(HttpClient);

  // 폼 필드
  name = '';
  email = '';
  phone = '';
  company = '';
  jobTitle = '';
  agreeTerms = false;
  agreeMarketing = false;

  // 상태
  submitting = signal(false);
  submitted = signal(false);
  submittedName = signal('');
  errorMessage = signal('');

  onSubmit() {
    // 유효성 검사
    if (!this.name.trim()) {
      this.errorMessage.set('이름을 입력해주세요.');
      return;
    }
    if (!this.email.trim() || !this.email.includes('@')) {
      this.errorMessage.set('올바른 이메일을 입력해주세요.');
      return;
    }
    if (!this.agreeTerms) {
      this.errorMessage.set('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);

    this.http.post('/api/preregistration', {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim() || undefined,
      company: this.company.trim() || undefined,
      jobTitle: this.jobTitle.trim() || undefined,
      agreeTerms: this.agreeTerms,
      agreeMarketing: this.agreeMarketing,
    }).subscribe({
      next: () => {
        this.submittedName.set(this.name.trim());
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('사전등록 실패:', err);
        this.errorMessage.set('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        this.submitting.set(false);
      },
    });
  }
}
