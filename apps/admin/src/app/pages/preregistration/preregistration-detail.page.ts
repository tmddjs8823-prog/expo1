import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PreRegistration } from './preregistration.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { AppDetailFieldsComponent, DetailField } from '../../shared/detail-fields/detail-fields.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-preregistration-detail',
  imports: [AppDetailFieldsComponent, PageHeaderComponent],
  templateUrl: './preregistration-detail.page.html',
})
export class PreregistrationDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

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

  async deleteRegistration() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/preregistration/${this.regId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/preregistration']); },
      error: handleApiError(this.toast, '사전등록 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/preregistration']);
  }
}
