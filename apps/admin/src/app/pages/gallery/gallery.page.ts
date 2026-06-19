import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { AdminDataGridComponent, GridRowDef } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';

export interface Gallery {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-gallery',
  imports: [FormsModule, DatePipe, AdminDataGridComponent, GridRowDef],
  templateUrl: './gallery.page.html'
})
export class GalleryPage {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  router = inject(Router);

  private toast = inject(ToastService);

  // 시그널 초기상태
  galleries = signal<Gallery[]>([]);
  title = signal('');
  description = signal('');
  imageUrl = signal('');
  selectedGalleryId = signal<number | null>(null);
  isEditing = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  published = signal(true);

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.galleries,
    filterFn: (g, kw) =>
      g.title.toLowerCase().includes(kw) ||
      (g.description ?? '').toLowerCase().includes(kw),
    pageSize: 3,
  });

  // 템플릿 바인딩용 alias
  searchKeyword = this.pg.searchKeyword;
  currentPage = this.pg.currentPage;
  totalPages = this.pg.totalPages;
  pagedGalleries = this.pg.paged;
  onPageChange = this.pg.onPageChange;

  constructor() {
    this.loadGalleries();
  }

  resetForm() {
    this.title.set('');
    this.description.set('');
    this.imageUrl.set('');
    this.selectedGalleryId.set(null);
    this.isEditing.set(false);
    this.selectedFile.set(null);
    this.published.set(true);
  }

  // 파일 선택
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
      this.imageUrl.set(URL.createObjectURL(input.files[0]));
    }
  }

  // 이미지 업로드
  async uploadImage(): Promise<string | null> {
    const file = this.selectedFile();
    if (!file) return this.imageUrl() || null;

    this.uploading.set(true);
    try {
      const url = await this.supabase.uploadImage('LSG', file);
      this.imageUrl.set(url);
      return url;
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      return null;
    } finally {
      this.uploading.set(false);
    }
  }

  loadGalleries() {
    this.http.get<Gallery[]>('/api/gallery?all=true').subscribe({
      next: (res) => this.galleries.set(res),
      error: handleApiError(this.toast, '갤러리 목록 조회 실패'),
    });
  }

  async createGallery() {
    if (!this.title().trim()) {
      this.toast.error('제목을 입력해주세요.');
      return;
    }
    if (!this.selectedFile() && !this.imageUrl()) {
      this.toast.error('이미지를 선택해주세요.');
      return;
    }

    const url = await this.uploadImage();
    if (!url) return;

    this.http.post('/api/gallery', {
      title: this.title(),
      description: this.description(),
      imageUrl: url,
      published: this.published(),
    }).subscribe({
      next: () => {
        this.toast.success('갤러리이(가) 생성되었습니다.');
        this.loadGalleries();
        this.resetForm();
      },
      error: handleApiError(this.toast, '갤러리 생성 실패'),
    });
  }

  editGallery(gallery: Gallery) {
    this.selectedGalleryId.set(gallery.id);
    this.title.set(gallery.title);
    this.description.set(gallery.description ?? '');
    this.imageUrl.set(gallery.imageUrl);
    this.published.set(gallery.published);
    this.isEditing.set(true);
  }

  async updateGallery() {
    const url = await this.uploadImage();

    this.http.patch(`/api/gallery/${this.selectedGalleryId()}`, {
      title: this.title(),
      description: this.description(),
      imageUrl: url || this.imageUrl(),
      published: this.published(),
    }).subscribe({
      next: () => {
        this.toast.success('갤러리이(가) 수정되었습니다.');
        this.loadGalleries();
        this.resetForm();
      },
      error: handleApiError(this.toast, '갤러리 수정 실패'),
    });
  }

  deleteGallery(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/gallery/${id}`).subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadGalleries();
        this.resetForm();
      },
      error: handleApiError(this.toast, '갤러리 삭제 실패'),
    });
  }
}
