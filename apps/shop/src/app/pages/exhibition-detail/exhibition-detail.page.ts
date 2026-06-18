import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

interface Exhibition {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  imageUrl?: string;
  status: string;
}

@Component({
  selector: 'app-exhibition-detail',
  imports: [RouterModule, DatePipe],
  templateUrl: './exhibition-detail.page.html'
})
export class ExhibitionDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  exhibition = signal<Exhibition | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Exhibition>(`/api/exhibition/${id}`).subscribe({
        next: (res) => this.exhibition.set(res),
        error: (err) => console.error('전시회 조회 실패:', err),
      });
    }
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
