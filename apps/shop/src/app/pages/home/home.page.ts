import { Component, inject, signal, computed, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FadeUpDirective } from '../../shared/fade-up.directive';

interface Banner {
  id: number;
  imageUrl: string;
}

interface Exhibition {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  status: string;
}

interface Gallery {
  id: number;
  title: string;

  description?: string;
  imageUrl: string;
  category?: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterModule, DatePipe, FadeUpDirective],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  router = inject(Router);

  banners = signal<Banner[]>([]);
  exhibitions = signal<Exhibition[]>([]);
  galleries = signal<Gallery[]>([]);
  currentBannerIndex = signal(0);
  bannerAutoplay = signal(true);
  private bannerInterval: ReturnType<typeof setInterval> | null = null;

  // 시설안내 섹션 상태
  facilityCategory = signal<string>('');
  facilityIndex = signal(0);

  facilityCategories = computed<string[]>(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const g of this.galleries()) {
      const cat = g.category ?? '기타';
      if (!seen.has(cat)) { seen.add(cat); result.push(cat); }
    }
    return result;
  });

  facilityFiltered = computed<Gallery[]>(() => {
    const cat = this.facilityCategory();
    if (!cat) return this.galleries();
    return this.galleries().filter(g => (g.category ?? '기타') === cat);
  });

  facilityItem = computed<Gallery | null>(() => {
    const list = this.facilityFiltered();
    if (list.length === 0) return null;
    const idx = this.facilityIndex();
    return list[Math.min(idx, list.length - 1)] ?? null;
  });

  selectCategory(cat: string) {
    this.facilityCategory.set(cat);
    this.facilityIndex.set(0);
  }

  facilityPrev() {
    const len = this.facilityFiltered().length;
    if (len <= 1) return;
    this.facilityIndex.update(i => (i - 1 + len) % len);
  }

  facilityNext() {
    const len = this.facilityFiltered().length;
    if (len <= 1) return;
    this.facilityIndex.update(i => (i + 1) % len);
  }

  getCategoryEn(cat: string): string {
    const map: Record<string, string> = {
      '전시홀': 'Exhibition Hall', '회의실': 'Conference Room',
      '식음시설': 'Food & Beverage', '지원시설': 'Support', '기타': 'Others',
    };
    return map[cat] ?? cat;
  }

  private currentSection = 0;
  private isScrolling = false;
  private wheelHandler = this.onWheel.bind(this);

  // 벨트 자동 스크롤
  private beltRafId = 0;
  private beltPaused = false;

  @ViewChild('exhibitionScroll') exhibitionScroll!: ElementRef<HTMLDivElement>;
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

  constructor() {
    this.loadBanners();
    this.loadExhibitions();
    this.loadGalleries();
  }

  private exhibitionInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    window.addEventListener('wheel', this.wheelHandler, { passive: false });
    this.startBelt();
  }

  ngOnDestroy() {
    window.removeEventListener('wheel', this.wheelHandler);
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    cancelAnimationFrame(this.beltRafId);
  }

  private startBelt() {
    const tick = () => {
      this.beltRafId = requestAnimationFrame(tick);
      if (this.beltPaused) return;
      const el = this.carouselTrack?.nativeElement;
      if (!el) return;

      const oneSetWidth = el.scrollWidth / 3;
      if (oneSetWidth === 0) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      el.scrollLeft += 0.8;

      // maxScroll 근처에 도달하면 1세트만큼 되감기
      if (el.scrollLeft >= maxScroll - 1) {
        el.scrollLeft -= oneSetWidth;
      }
    };
    this.beltRafId = requestAnimationFrame(tick);
  }

  private getSections(): HTMLElement[] {
    const el = document.querySelector('app-home');
    if (!el) return [];
    return Array.from(el.querySelectorAll(':scope > section'));
  }

  private onWheel(e: WheelEvent) {
    if (this.isScrolling) { e.preventDefault(); return; }

    const sections = this.getSections();
    if (sections.length === 0) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    const HEADER = 96;

    // 현재 화면에서 헤더 바로 아래에 가장 가까운 섹션을 실시간 감지
    let currentIdx = 0;
    let minDist = Infinity;
    sections.forEach((sec, i) => {
      const dist = Math.abs(sec.getBoundingClientRect().top - HEADER);
      if (dist < minDist) { minDist = dist; currentIdx = i; }
    });

    const next = currentIdx + direction;
    if (next < 0 || next >= sections.length) return;

    e.preventDefault();
    this.isScrolling = true;
    this.currentSection = next;

    const target = sections[next];
    const isLast = next === sections.length - 1;

    if (isLast) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    } else {
      // ① 위치를 먼저 계산 (transform 적용 전)
      const targetTop = target.getBoundingClientRect().top + window.scrollY - HEADER;

      // ② 그 다음 애니메이션 스타일 적용
      target.style.opacity = '0';
      target.style.transform = direction > 0 ? 'translateY(50px)' : 'translateY(-50px)';
      target.style.transition = 'none';

      // ③ 계산된 위치로 스크롤
      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      setTimeout(() => {
        target.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
      }, 250);

      setTimeout(() => {
        target.style.transition = '';
        target.style.opacity = '';
        target.style.transform = '';
      }, 800);
    }

    setTimeout(() => { this.isScrolling = false; }, 900);
  }

  loadBanners() {
    this.http.get<Banner[]>('/api/banner').subscribe({
      next: (res) => {
        this.banners.set(res);
        this.startAutoSlide();
      },
    });
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition').subscribe({
      next: (res) => this.exhibitions.set(res.slice(0, 6)),
    });
  }

  loadGalleries() {
    this.http.get<Gallery[]>('/api/gallery').subscribe({
      next: (res) => {
        this.galleries.set(res);
        const cats = this.facilityCategories();
        if (cats.length > 0) {
          this.selectCategory(cats[0]);
        }
      },
    });
  }

  startAutoSlide() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    if (this.banners().length <= 1) return;
    this.bannerInterval = setInterval(() => {
      if (this.bannerAutoplay()) this.nextBanner();
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

  toggleAutoplay() {
    this.bannerAutoplay.update(v => !v);
  }

  scrollToContent() {
    window.scrollTo({ top: window.innerHeight - 64, behavior: 'smooth' });
  }


  scrollCarousel(direction: 'left' | 'right') {
    const el = this.carouselTrack?.nativeElement;
    if (!el) return;

    // 첫 번째 카드 실제 너비 + gap 동적 계산
    const firstCard = el.querySelector(':scope > div') as HTMLElement;
    if (!firstCard) return;
    const gap = parseFloat(getComputedStyle(el).gap) || 24;
    const CARD_PX = firstCard.offsetWidth + gap;

    const oneSetWidth = el.scrollWidth / 3;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (oneSetWidth === 0) return;

    // 벨트 일시 정지
    this.beltPaused = true;

    // 오른쪽: maxScroll에 걸리기 전에 미리 되감기
    if (direction === 'right' && el.scrollLeft + CARD_PX >= maxScroll) {
      el.scrollLeft -= oneSetWidth;
    }
    // 왼쪽: 0 이하로 가기 전에 미리 앞으로 점프
    if (direction === 'left' && el.scrollLeft - CARD_PX <= 0) {
      el.scrollLeft += oneSetWidth;
    }

    // 부드러운 이동
    const start = el.scrollLeft;
    const target = start + (direction === 'right' ? CARD_PX : -CARD_PX);
    const diff = target - start;
    const duration = 400;
    let startTime: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.scrollLeft = start + diff * ease;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 벨트 재개
        this.beltPaused = false;
      }
    };
    requestAnimationFrame(animate);
  }
}
