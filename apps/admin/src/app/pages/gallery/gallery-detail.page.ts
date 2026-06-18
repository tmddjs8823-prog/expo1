import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Gallery } from './gallery.page';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-gallery-detail',
  imports: [FormsModule],
  templateUrl: './gallery-detail.page.html',
})
export class GalleryDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  private supabase = inject(SupabaseService);

  galleryId = Number(this.route.snapshot.paramMap.get('id'));
  title = signal('');
  description = signal('');
  imageUrl = signal('');
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  published = signal(false);

  constructor() {
    this.loadGallery();
  }

  loadGallery() {
    this.http.get<Gallery>(`/api/gallery/${this.galleryId}`).subscribe({
      next: (res) => {
        this.title.set(res.title);
        this.description.set(res.description ?? '');
        this.imageUrl.set(res.imageUrl);
        this.published.set(res.published);
      },
      error: (err) => { console.error('갤러리 조회 실패:', err); this.toast.error('갤러리 조회 실패'); },
    });
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

  async updateGallery() {
    const url = await this.uploadImage();
    this.http.patch(`/api/gallery/${this.galleryId}`, {
      title: this.title(),
      description: this.description(),
      imageUrl: url || this.imageUrl(),
      published: this.published(),
    }).subscribe({
      next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/gallery']); },
      error: (err) => { console.error('갤러리 수정 실패:', err); this.toast.error('갤러리 수정 실패'); },
    });
  }

  deleteGallery() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/gallery/${this.galleryId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/gallery']); },
      error: (err) => { console.error('갤러리 삭제 실패:', err); this.toast.error('갤러리 삭제 실패'); },
    });
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }
}
