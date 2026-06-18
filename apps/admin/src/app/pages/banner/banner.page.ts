import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';

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
  imports: [FormsModule, DatePipe],
  templateUrl: './banner.page.html',
})
export class BannerPage {
  private http = inject(HttpClient);

  private toast = inject(ToastService);
  private supabase = inject(SupabaseService);

  banners = signal<Banner[]>([]);
  searchKeyword = signal('');
  filteredBanners = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.banners();
    return this.banners().filter(b =>
      b.title.toLowerCase().includes(keyword)
    );
  });

  // 폼
  title = signal('');
  subtitle = signal('');
  imageUrl = signal('');
  linkUrl = signal('');
  published = signal(true);
  sortOrder = signal(0);
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
    this.sortOrder.set(0);
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
    this.http.get<Banner[]>('/api/banner').subscribe({
      next: (res) => this.banners.set(res),
      error: (err) => { console.error('배너 조회 실패:', err); this.toast.error('배너 조회 실패'); },
    });
  }

  async createBanner() {
    const url = await this.uploadImage();
    if (!url) { this.toast.error('이미지를 등록해주세요.'); return; }
    if (!this.title()) { this.toast.error('제목을 입력해주세요.'); return; }

    this.http.post('/api/banner', {
      title: this.title(),
      subtitle: this.subtitle() || undefined,
      imageUrl: url,
      linkUrl: this.linkUrl() || undefined,
      published: this.published(),
      sortOrder: this.sortOrder(),
    }).subscribe({
      next: () => { this.toast.success('배너가 생성되었습니다.'); this.loadBanners(); this.resetForm(); },
      error: (err) => { console.error('배너 생성 실패:', err); this.toast.error('배너 생성 실패'); },
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
      subtitle: this.subtitle() || undefined,
      imageUrl: url ?? this.imageUrl(),
      linkUrl: this.linkUrl() || undefined,
      published: this.published(),
      sortOrder: this.sortOrder(),
    }).subscribe({
      next: () => { this.toast.success('배너가 수정되었습니다.'); this.loadBanners(); this.resetForm(); },
      error: (err) => { console.error('배너 수정 실패:', err); this.toast.error('배너 수정 실패'); },
    });
  }

  deleteBanner(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/banner/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadBanners(); },
      error: (err) => { console.error('배너 삭제 실패:', err); this.toast.error('배너 삭제 실패'); },
    });
  }
}
