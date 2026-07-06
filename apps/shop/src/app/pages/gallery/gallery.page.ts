import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FadeUpDirective } from '../../shared/fade-up.directive';

interface Facility {
  id: number;
  title: string;

  description?: string;
  imageUrl: string;

  category?: string;

}

@Component({
  selector: 'app-gallery',
  imports: [RouterModule, FadeUpDirective],
  templateUrl: './gallery.page.html',
})
export class GalleryPage {
  private http = inject(HttpClient);

  facilities = signal<Facility[]>([]);
  selectedCategory = signal<string>('');
  selectedFacility = signal<Facility | null>(null);

  // 유니크 카테고리 목록 (순서 유지)
  categories = computed<string[]>(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const f of this.facilities()) {
      const cat = f.category ?? '기타';
      if (!seen.has(cat)) { seen.add(cat); result.push(cat); }
    }
    return result;
  });

  // 현재 카테고리의 시설 목록
  filteredFacilities = computed<Facility[]>(() => {
    const cat = this.selectedCategory();
    if (!cat) return this.facilities();
    return this.facilities().filter(f => (f.category ?? '기타') === cat);
  });

  constructor() {
    this.loadFacilities();
  }

  loadFacilities() {
    this.http.get<Facility[]>('/api/gallery').subscribe({
      next: (res) => {
        this.facilities.set(res);
        // 첫 번째 카테고리 자동 선택
        const cats = this.categories();
        if (cats.length > 0) {
          this.selectedCategory.set(cats[0]);
          const first = this.filteredFacilities()[0];
          if (first) this.selectedFacility.set(first);
        }
      },
      error: (err) => console.error('시설 정보 조회 실패:', err),
    });
  }

  selectCategory(cat: string) {
    if (this.selectedCategory() === cat) return;
    this.selectedCategory.set(cat);
    const first = this.filteredFacilities()[0];
    this.selectedFacility.set(first ?? null);
  }

  selectFacility(f: Facility) {
    this.selectedFacility.set(f);
  }

  // 카테고리 영문명 매핑
  getCategoryEn(cat: string): string {
    const map: Record<string, string> = {
      '전시홀': 'Exhibition Hall',
      '회의실': 'Conference Room',
      '식음시설': 'Food & Beverage',
      '지원시설': 'Support',
      '기타': 'Others',
    };
    return map[cat] ?? cat;
  }
}
