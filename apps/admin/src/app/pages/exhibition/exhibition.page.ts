import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

export interface Exhibition {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  status: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-exhibition',
  imports: [FormsModule, DatePipe],
  templateUrl: './exhibition.page.html',
})
export class ExhibitionPage {
  private http = inject(HttpClient);
  router = inject(Router);

  exhibitions = signal<Exhibition[]>([]);
  searchKeyword = signal('');
  filteredExhibitions = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.exhibitions();
    return this.exhibitions().filter(e =>
      e.title.toLowerCase().includes(keyword) ||
      (e.venue ?? '').toLowerCase().includes(keyword) ||
      e.status.toLowerCase().includes(keyword)
    );
  });
  exhibitionForm = signal<Exhibition>({
    id: 0,
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    startDate: '',
    endDate: '',
    venue: '',
    status: 'DRAFT',
    published: false,
  });

  constructor() {
    this.loadExhibitions();
  }

  resetForm() {
    this.exhibitionForm.set({
      id: 0,
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      startDate: '',
      endDate: '',
      venue: '',
      status: 'DRAFT',
      published: false,
    });
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: (err) => console.error('전시회 목록 조회 실패:', err),
    });
  }

  createExhibition() {
    const data = this.exhibitionForm();
    if (!data.title || !data.startDate || !data.endDate) {
      alert('제목, 시작일, 종료일은 필수입니다.');
      return;
    }
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      alert('종료일은 시작일보다 이후여야 합니다.');
      return;
    }
    
    const payload = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      venue: data.venue,
      status: data.status,
      published: data.published,
    };

    this.http.post('/api/exhibition', payload).subscribe({
      next: () => {
        this.loadExhibitions();
        this.resetForm();
      },
      error: (err) => console.error('전시회 생성 실패:', err),
    });
  }

  deleteExhibition(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/exhibition/${id}`).subscribe({
      next: () => this.loadExhibitions(),
      error: (err) => console.error('전시회 삭제 실패:', err),
    });
  }
}
