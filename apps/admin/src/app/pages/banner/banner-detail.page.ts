import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError, handleDeleteError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Banner } from './banner.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useImageUpload } from '../../shared/utils/image-upload.utils';

@Component({
  selector: 'app-banner-detail',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './banner-detail.page.html',
})
export class BannerDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private supabase = inject(SupabaseService);

  isCreateMode = this.route.snapshot.paramMap.get('id') === 'new';
  bannerId = this.isCreateMode ? 0 : Number(this.route.snapshot.paramMap.get('id'));
  title = signal('');
  subtitle = signal('');
  linkUrl = signal('');
  published = signal(true);
  sortOrder = signal(1);
  exhibitionId = signal<number | null>(null);
  exhibitions = signal<{ id: number; title: string }[]>([]);

  // 이미지 업로드 (공통 유틸)
  private imgUpload = useImageUpload(this.supabase, 'LSG');
  imageUrl = this.imgUpload.imageUrl;
  uploading = this.imgUpload.uploading;
  onFileSelected = this.imgUpload.onFileSelected.bind(this.imgUpload);

  constructor() {
    if (!this.isCreateMode) {
      this.loadBanner();
    }
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<{ id: number; title: string }[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  loadBanner() {
    this.http.get<Banner>(`/api/banner/${this.bannerId}`).subscribe({
      next: (res) => {
        this.title.set(res.title);
        this.subtitle.set(res.subtitle ?? '');
        this.imageUrl.set(res.imageUrl);
        this.linkUrl.set(res.linkUrl ?? '');
        this.published.set(res.published);
        this.sortOrder.set(res.sortOrder);
        this.exhibitionId.set(res.exhibitionId ?? null);
      },
      error: handleApiError(this.toast, '배너 조회 실패'),
    });
  }

  async save() {
    const url = await this.imgUpload.upload();
    const payload = {
      title: this.title(),
      subtitle: this.subtitle()?.trim() || null,
      imageUrl: url || this.imageUrl(),
      linkUrl: this.linkUrl()?.trim() || null,
      published: this.published(),
      sortOrder: this.sortOrder(),
      exhibitionId: this.exhibitionId() || undefined,
    };

    if (this.isCreateMode) {
      this.http.post('/api/banner', payload).subscribe({
        next: () => { this.toast.success('생성되었습니다.'); this.router.navigate(['/banner']); },
        error: handleApiError(this.toast, '배너 생성 실패'),
      });
    } else {
      this.http.patch(`/api/banner/${this.bannerId}`, payload).subscribe({
        next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/banner']); },
        error: handleApiError(this.toast, '배너 수정 실패'),
      });
    }
  }

  async deleteBanner() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/banner/${this.bannerId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/banner']); },
      error: handleDeleteError(this.confirmDialog, '배너 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/banner']);
  }

  async resetForm() {
    const ok = await this.confirmDialog.open({ message: '입력한 내용을 초기화하시겠습니까?' });
    if (!ok) return;
    if (this.isCreateMode) {
      this.title.set('');
      this.subtitle.set('');
      this.linkUrl.set('');
      this.published.set(true);
      this.sortOrder.set(1);
      this.exhibitionId.set(null);
      this.imgUpload.selectedFile.set(null);
    }
  }
}
