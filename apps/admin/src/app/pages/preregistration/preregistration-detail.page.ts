import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PreRegistration } from './preregistration.page';
import { ToastService } from '../../shared/toast/toast.service';
import { AppDetailFieldsComponent, DetailField } from '../../shared/detail-fields/detail-fields.component';

@Component({
  selector: 'app-preregistration-detail',
  imports: [AppDetailFieldsComponent],
  templateUrl: './preregistration-detail.page.html',
})
export class PreregistrationDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);

  private datePipe = inject(DatePipe);

  regId = Number(this.route.snapshot.paramMap.get('id'));
  registration = signal<PreRegistration | null>(null);

  detailFields = computed<DetailField[]>(() => {
    const r = this.registration();
    if (!r) return [];
    return [
      { label: '이름', value: r.name },
      { label: '이메일', value: r.email },
      { label: '전화번호', value: r.phone || '-' },
      { label: '회사', value: r.company || '-' },
      { label: '직책', value: r.jobTitle || '-' },
      { label: '등록일', value: this.datePipe.transform(r.createdAt, 'yyyy-MM-dd HH:mm') ?? '' },
      { label: '전시회', value: r.exhibition?.title || '-' },
    ];
  });

  constructor() {
    this.loadRegistration();
  }

  loadRegistration() {
    this.http.get<PreRegistration>(`/api/preregistration/${this.regId}`).subscribe({
      next: (res) => this.registration.set(res),
      error: handleApiError(this.toast, '사전등록 조회 실패'),
    });
  }

  deleteRegistration() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/preregistration/${this.regId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/preregistration']); },
      error: handleApiError(this.toast, '사전등록 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/preregistration']);
  }
}
