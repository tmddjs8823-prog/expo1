import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  published: boolean;
  sortOrder: number;
}

interface Exhibition {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  published: boolean;
}

interface Gallery {
  id: number;
  title: string;
  imageUrl: string;
  published: boolean;
}

@Component({
  selector: 'app-home',
  imports: [RouterModule, DatePipe],
  templateUrl: './home.page.html',
})
export class HomePage {
  private http = inject(HttpClient);
  router = inject(Router);

  banners = signal<Banner[]>([]);
  exhibitions = signal<Exhibition[]>([]);
  galleries = signal<Gallery[]>([]);
  currentBannerIndex = signal(0);
  private bannerInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadBanners();
    this.loadExhibitions();
    this.loadGalleries();
  }

  loadBanners() {
    this.http.get<Banner[]>('/api/banner').subscribe({
      next: (res) => {
        this.banners.set(res.filter(b => b.published));
        this.startAutoSlide();
      },
    });
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition').subscribe({
      next: (res) => this.exhibitions.set(res.filter(ex => ex.status === 'PUBLISHED').slice(0, 3)),
    });
  }

  loadGalleries() {
    this.http.get<Gallery[]>('/api/gallery').subscribe({
      next: (res) => this.galleries.set(res.filter(g => g.published).slice(0, 3)),
    });
  }

  startAutoSlide() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    if (this.banners().length <= 1) return;
    this.bannerInterval = setInterval(() => {
      this.nextBanner();
    }, 5000);
  }

  nextBanner() {
    const total = this.banners().length;
    if (total === 0) return;
    this.currentBannerIndex.set((this.currentBannerIndex() + 1) % total);
  }

  prevBanner() {
    const total = this.banners().length;
    if (total === 0) return;
    this.currentBannerIndex.set((this.currentBannerIndex() - 1 + total) % total);
  }

  goToBanner(index: number) {
    this.currentBannerIndex.set(index);
    this.startAutoSlide();
  }

  onBannerClick(url: string) {
    if (!url || url.trim().length === 0) return;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // 외부 링크 → 새 탭
      window.open(trimmed, '_blank');
    } else if (trimmed.startsWith('/')) {
      // 내부 라우트
      this.router.navigateByUrl(trimmed);
    } else {
      // http 없이 도메인만 입력한 경우 (예: www.naver.com)
      window.open('https://' + trimmed, '_blank');
    }
  }
}
