import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError, handleDeleteError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Gallery } from './gallery.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useImageUpload } from '../../shared/utils/image-upload.utils';

@Component({
  selector: 'app-gallery-detail',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './gallery-detail.page.html',
})
export class GalleryDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private supabase = inject(SupabaseService);

  isCreateMode = this.route.snapshot.paramMap.get('id') === 'new';
  galleryId = this.isCreateMode ? 0 : Number(this.route.snapshot.paramMap.get('id'));
  title = signal('');
  description = signal('');
  category = signal('');
  published = signal(true);
  exhibitionId = signal<number | null>(null);
  exhibitions = signal<{ id: number; title: string }[]>([]);

  // 카테고리 선택 옵션
  readonly categoryOptions = ['전시홀', '회의실', '식음시설', '지원시설', '기타'];

  // 이미지 업로드 (공통 유틸)
  private imgUpload = useImageUpload(this.supabase, 'LSG');
  imageUrl = this.imgUpload.imageUrl;
  uploading = this.imgUpload.uploading;
  onFileSelected = this.imgUpload.onFileSelected.bind(this.imgUpload);

  constructor() {
    if (!this.isCreateMode) {
      this.loadGallery();
    }
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<{ id: number; title: string }[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  loadGallery() {
    this.http.get<Gallery>(`/api/gallery/${this.galleryId}`).subscribe({
      next: (res) => {
        this.title.set(res.title);
        this.description.set(res.description ?? '');
        this.category.set(res.category ?? '');
        this.imageUrl.set(res.imageUrl);
        this.published.set(res.published);
        this.exhibitionId.set(res.exhibitionId ?? null);
      },
      error: handleApiError(this.toast, '갤러리 조회 실패'),
    });
  }



  async save() {
    const url = await this.imgUpload.upload();
    const payload = {
      title: this.title(),
      description: this.description(),
      category: this.category() || undefined,
      imageUrl: url || this.imageUrl(),
      published: this.published(),
      exhibitionId: this.exhibitionId() || undefined,
    };

    if (this.isCreateMode) {
      this.http.post('/api/gallery', payload).subscribe({
        next: () => { this.toast.success('생성되었습니다.'); this.router.navigate(['/gallery']); },
        error: handleApiError(this.toast, '갤러리 생성 실패'),
      });
    } else {
      this.http.patch(`/api/gallery/${this.galleryId}`, payload).subscribe({
        next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/gallery']); },
        error: handleApiError(this.toast, '갤러리 수정 실패'),
      });
    }
  }

  async deleteGallery() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/gallery/${this.galleryId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/gallery']); },
      error: handleDeleteError(this.confirmDialog, '갤러리 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }

  async resetForm() {
    const ok = await this.confirmDialog.open({ message: '입력한 내용을 초기화하시겠습니까?' });
    if (!ok) return;
    if (this.isCreateMode) {
      this.title.set('');
      this.description.set('');
      this.published.set(true);
      this.exhibitionId.set(null);
      this.imgUpload.selectedFile.set(null);
    }
  }
}
