import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { AdminDataGridComponent, GridRowDef } from '../../shared/data-grid/data-grid.component';
import { useClientPagination } from '../../shared/utils/pagination.utils';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

@Component({
  selector: 'app-banner',
  imports: [FormsModule, DatePipe, AdminDataGridComponent, GridRowDef],
  templateUrl: './banner.page.html',
})
export class BannerPage {
  private http = inject(HttpClient);

  private toast = inject(ToastService);
  private supabase = inject(SupabaseService);

  banners = signal<Banner[]>([]);

  // 검색 + 필터링 (공통 유틸리티 — 페이지네이션 미사용)
  pg = useClientPagination({
    items: this.banners,
    filterFn: (b, kw) => b.title.toLowerCase().includes(kw),
  });

  // 템플릿 바인딩용 alias
  searchKeyword = this.pg.searchKeyword;
  filteredBanners = this.pg.filtered;

  // 폼
  title = signal('');
  subtitle = signal('');
  imageUrl = signal('');
  linkUrl = signal('');
  published = signal(true);
  sortOrder = signal(1);
  selectedBannerId = signal<number | null>(null);
  isEditing = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);

  constructor() {
    this.loadBanners();
  }

  resetForm() {
    this.title.set('');
    this.subtitle.set('');
    this.imageUrl.set('');
    this.linkUrl.set('');
    this.published.set(true);
    this.sortOrder.set(1);
    this.selectedBannerId.set(null);
    this.isEditing.set(false);
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
      this.imageUrl.set(URL.createObjectURL(input.files[0]));
    }
  }

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

  loadBanners() {
    this.http.get<Banner[]>('/api/banner?all=true').subscribe({
      next: (res) => this.banners.set(res),
      error: handleApiError(this.toast, '배너 조회 실패'),
    });
  }

  async createBanner() {
    const url = await this.uploadImage();
    if (!url) { this.toast.error('이미지를 등록해주세요.'); return; }
    if (!this.title()) { this.toast.error('제목을 입력해주세요.'); return; }

    this.http.post('/api/banner', {
      title: this.title(),
      subtitle: this.subtitle()?.trim() || null,
      imageUrl: url,
      linkUrl: this.linkUrl()?.trim() || null,
      published: this.published(),
      sortOrder: this.sortOrder(),
    }).subscribe({
      next: () => { this.toast.success('배너가 생성되었습니다.'); this.loadBanners(); this.resetForm(); },
      error: handleApiError(this.toast, '배너 생성 실패'),
    });
  }

  editBanner(banner: Banner) {
    this.selectedBannerId.set(banner.id);
    this.title.set(banner.title);
    this.subtitle.set(banner.subtitle ?? '');
    this.imageUrl.set(banner.imageUrl);
    this.linkUrl.set(banner.linkUrl ?? '');
    this.published.set(banner.published);
    this.sortOrder.set(banner.sortOrder);
    this.isEditing.set(true);
  }

  async updateBanner() {
    const id = this.selectedBannerId();
    if (!id) return;
    const url = await this.uploadImage();

    this.http.patch(`/api/banner/${id}`, {
      title: this.title(),
      subtitle: this.subtitle()?.trim() || null,
      imageUrl: url ?? this.imageUrl(),
      linkUrl: this.linkUrl()?.trim() || null,
      published: this.published(),
      sortOrder: this.sortOrder(),
    }).subscribe({
      next: () => { this.toast.success('배너가 수정되었습니다.'); this.loadBanners(); this.resetForm(); },
      error: handleApiError(this.toast, '배너 수정 실패'),
    });
  }

  deleteBanner(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/banner/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadBanners(); },
      error: handleApiError(this.toast, '배너 삭제 실패'),
    });
  }
}
