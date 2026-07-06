import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError, handleDeleteError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Exhibitor, Exhibition } from './exhibitor.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-exhibitor-detail',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './exhibitor-detail.page.html'
})
export class ExhibitorDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  isCreateMode = this.route.snapshot.paramMap.get('id') === 'new';
  exhibitorId = this.isCreateMode ? 0 : Number(this.route.snapshot.paramMap.get('id'));

  exhibitions = signal<Exhibition[]>([]);
  exhibitorForm = signal<Exhibitor>({
    id: 0,
    companyName: '',
    companyNameEn: '',
    description: '',
    boothNumber: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    published: true,

    exhibitionId: 0,
  });

  constructor() {
    if (!this.isCreateMode) {
      this.loadExhibitor();
    }
    this.loadExhibitions();
  }

  loadExhibitor() {
    this.http.get<Exhibitor>(`/api/exhibitor/${this.exhibitorId}`).subscribe({
      next: (res) => this.exhibitorForm.set(res),
      error: handleApiError(this.toast, '참가업체 조회 실패'),
    });
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  save() {
    const data = this.exhibitorForm();
    if (!data.companyName || !data.exhibitionId) {
      this.toast.error('업체명과 전시회 선택은 필수입니다.');
      return;
    }

    const payload = {
      companyName: data.companyName,
      companyNameEn: data.companyNameEn,
      description: data.description,
      boothNumber: data.boothNumber,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      website: data.website,
      exhibitionId: data.exhibitionId,
    };

    if (this.isCreateMode) {
      this.http.post('/api/exhibitor', payload).subscribe({
        next: () => { this.toast.success('생성되었습니다.'); this.router.navigate(['/exhibitor']); },
        error: handleApiError(this.toast, '참가업체 생성 실패'),
      });
    } else {
      this.http.patch(`/api/exhibitor/${this.exhibitorId}`, payload).subscribe({
        next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/exhibitor']); },
        error: handleApiError(this.toast, '참가업체 수정 실패'),
      });
    }
  }

  async deleteExhibitor() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/exhibitor/${this.exhibitorId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/exhibitor']); },
      error: handleDeleteError(this.confirmDialog, '참가업체 삭제 실패'),
    });
  }

  goBack() { this.router.navigate(['/exhibitor']); }

  async resetForm() {
    const ok = await this.confirmDialog.open({ message: '입력한 내용을 초기화하시겠습니까?' });
    if (!ok) return;
    if (this.isCreateMode) {
      this.exhibitorForm.set({
        id: 0,
        companyName: '',
        companyNameEn: '',
        description: '',
        boothNumber: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        published: true,

        exhibitionId: 0,
      });
    }
  }
}
