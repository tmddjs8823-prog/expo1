import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

interface Gallery {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
}

@Component({
  selector: 'app-gallery',
  imports: [RouterModule, PaginationComponent],
  templateUrl: './gallery.page.html',
})
export class GalleryPage {
  private http = inject(HttpClient);

  galleries = signal<Gallery[]>([]);
  selectedIndex = signal<number | null>(null);

  // 공개된 항목만 필터링

  // 페이지네이션
  currentPage = signal(1);
  pageSize = 3;
  totalPages = computed(() => Math.ceil(this.galleries().length / this.pageSize));
  pagedGalleries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.galleries().slice(start, start + this.pageSize);
  });

  constructor() {
    this.loadGalleries();
  }

  loadGalleries() {
    this.http.get<Gallery[]>('/api/gallery').subscribe({
      next: (res) => this.galleries.set(res),
      error: (err) => console.error('갤러리 조회 실패:', err),
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openLightbox(index: number) {
    this.selectedIndex.set(index);
  }

  closeLightbox() {
    this.selectedIndex.set(null);
  }

  prevImage(event: Event) {
    event.stopPropagation();
    const current = this.selectedIndex();
    if (current === null) return;
    const total = this.pagedGalleries().length;
    this.selectedIndex.set((current - 1 + total) % total);
  }

  nextImage(event: Event) {
    event.stopPropagation();
    const current = this.selectedIndex();
    if (current === null) return;
    const total = this.pagedGalleries().length;
    this.selectedIndex.set((current + 1) % total);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.selectedIndex() === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowLeft') this.prevImage(event);
    if (event.key === 'ArrowRight') this.nextImage(event);
  }
}
