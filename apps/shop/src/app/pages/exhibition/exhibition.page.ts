import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

interface Exhibition {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  imageUrl?: string;
  status: string;
  published: boolean;
}

@Component({
  selector: 'app-exhibition',
  imports: [RouterModule, DatePipe, PaginationComponent],
  templateUrl: './exhibition.page.html',
})
export class ExhibitionPage {
  private http = inject(HttpClient);
  exhibitions = signal<Exhibition[]>([]);

  // 상태 우선순위: 진행중 → 예정 → 종료
  private statusOrder: Record<string, number> = { PUBLISHED: 0, DRAFT: 1, CLOSED: 2 };
  publishedExhibitions = computed(() =>
    [...this.exhibitions()].sort((a, b) =>
      (this.statusOrder[a.status] ?? 9) - (this.statusOrder[b.status] ?? 9)
      || new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  );

  // 페이지네이션
  currentPage = signal(1);
  pageSize = 3;
  totalPages = computed(() => Math.ceil(this.publishedExhibitions().length / this.pageSize));
  pagedExhibitions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.publishedExhibitions().slice(start, start + this.pageSize);
  });

  constructor() {
    this.http.get<Exhibition[]>('/api/exhibition').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: (err) => console.error('전시회 조회 실패:', err),
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStatusLabel(status: string) {
    switch (status) {
      case 'PUBLISHED': return '진행중';
      case 'CLOSED': return '종료';
      default: return '예정';
    }
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-red-100 text-red-600';
      default: return 'bg-blue-100 text-blue-700';
    }
  }
}
