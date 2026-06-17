import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

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
  imports: [FormsModule, DatePipe],
  templateUrl: './gallery.page.html'
})
export class GalleryPage {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  router = inject(Router);

  // 시그널 초기상태
  galleries = signal<Gallery[]>([]);
  searchKeyword = signal('');
  filteredGalleries = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.galleries();
    return this.galleries().filter(g =>
      g.title.toLowerCase().includes(keyword) ||
      (g.description ?? '').toLowerCase().includes(keyword)
    );
  });
  title = signal('');
  description = signal('');
  imageUrl = signal('');
  selectedGalleryId = signal<number | null>(null);
  isEditing = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);

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
    this.http.get<Gallery[]>('/api/gallery').subscribe({
      next: (res) => this.galleries.set(res),
      error: (err) => console.error('갤러리 목록 조회 실패:', err),
    });
  }

  async createGallery() {
    const url = await this.uploadImage();
    if (!url) return;

    this.http.post('/api/gallery', {
      title: this.title(),
      description: this.description(),
      imageUrl: url,
    }).subscribe({
      next: () => {
        this.loadGalleries();
        this.resetForm();
      },
      error: (err) => console.error('갤러리 생성 실패:', err),
    });
  }

  editGallery(gallery: Gallery) {
    this.selectedGalleryId.set(gallery.id);
    this.title.set(gallery.title);
    this.description.set(gallery.description ?? '');
    this.imageUrl.set(gallery.imageUrl);
    this.isEditing.set(true);
  }

  async updateGallery() {
    const url = await this.uploadImage();

    this.http.patch(`/api/gallery/${this.selectedGalleryId()}`, {
      title: this.title(),
      description: this.description(),
      imageUrl: url || this.imageUrl(),
    }).subscribe({
      next: () => {
        this.loadGalleries();
        this.resetForm();
      },
      error: (err) => console.error('갤러리 수정 실패:', err),
    });
  }

  deleteGallery(id: number) {
    this.http.delete(`/api/gallery/${id}`).subscribe({
      next: () => {
        this.loadGalleries();
        this.resetForm();
      },
      error: (err) => console.error('갤러리 삭제 실패:', err),
    });
  }
}
