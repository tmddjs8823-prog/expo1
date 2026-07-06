import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Exhibition {
  id: number;
  title: string;
}

@Component({
  selector: 'app-exhibitor',
  imports: [FormsModule, RouterModule],
  templateUrl: './exhibitor.page.html',
})
export class ExhibitorPage {
  private http = inject(HttpClient);

  exhibitions = signal<Exhibition[]>([]);
  exhibitionId = signal<number | null>(null);
  companyName = signal('');
  companyNameEn = signal('');
  boothNumber = signal('');
  description = signal('');
  contactEmail = signal('');
  contactPhone = signal('');
  website = signal('');

  // 상태
  submitting = signal(false);
  submitted = signal(false);
  submittedName = signal('');
  errorMessage = signal('');

  constructor() {
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
    });
  }

  submitForm() {
    if (!this.companyName().trim()) {
      this.errorMessage.set('업체명을 입력해주세요.');
      return;
    }
    if (/\d/.test(this.companyName())) {
      this.errorMessage.set('업체명에 숫자를 입력할 수 없습니다.');
      return;
    }
    if (!this.exhibitionId()) {
      this.errorMessage.set('전시회를 선택해주세요.');
      return;
    }
    if (this.contactEmail().trim() && !this.contactEmail().includes('@')) {
      this.errorMessage.set('올바른 이메일을 입력해주세요.');
      return;
    }
    if (!this.contactPhone().trim() || !/^[\d-]+$/.test(this.contactPhone().trim())) {
      this.errorMessage.set('올바른 전화번호를 입력해주세요.');
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);

    this.http.post('/api/exhibitor', {
      companyName: this.companyName().trim(),
      companyNameEn: this.companyNameEn()?.trim() || undefined,
      boothNumber: this.boothNumber()?.trim() || undefined,
      description: this.description()?.trim() || undefined,
      contactEmail: this.contactEmail()?.trim() || undefined,
      contactPhone: this.contactPhone()?.trim() || undefined,
      website: this.website()?.trim() || undefined,
      exhibitionId: this.exhibitionId(),
    }).subscribe({
      next: () => {
        this.submittedName.set(this.companyName().trim());
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('참가업체 등록 실패:', err);
        const msg = err.error?.message;
        this.errorMessage.set(
          Array.isArray(msg) ? msg.join('\n') : (msg || '등록 중 오류가 발생했습니다. 다시 시도해주세요.')
        );
        this.submitting.set(false);
      },
    });
  }
}
