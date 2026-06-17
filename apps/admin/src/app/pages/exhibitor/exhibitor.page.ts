import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // ← import 추가
import { Exhibition } from '../exhibition/exhibition.page';

export interface Exhibitor {
  exhibitionId: number;
  id: number;
  companyName: string;
  companyNameEn?: string;
  description?: string;
  boothNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  published?: boolean;
  sortOrder?: number;
  exhibition?: Exhibition;
  createdAt?: string;
  updatedAt?: string;
}


@Component({
  selector: 'app-exhibitor',
  imports: [FormsModule],
  templateUrl: './exhibitor.page.html'
})
export class ExhibitorPage {
  private http = inject(HttpClient);
  router = inject(Router);

  //초기 시그널 폼 정의
  exhibitors = signal<Exhibitor[]>([]);
  searchKeyword = signal('');
  filteredExhibitors = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.exhibitors();
    return this.exhibitors().filter(e =>
      e.companyName.toLowerCase().includes(keyword) ||
      (e.boothNumber ?? '').toLowerCase().includes(keyword) ||
      (e.contactEmail ?? '').toLowerCase().includes(keyword) ||
      (e.exhibition?.title ?? '').toLowerCase().includes(keyword)
    );
  });
  exhibitions = signal<Exhibition[]>([]);
  exhibitorForm = signal<Exhibitor>({
    id: 0,
    companyName: '',
    companyNameEn: '',
    boothNumber: '',
    published: false,
    sortOrder: 0,
    exhibitionId: 0,
  });

  resetForm() {
    this.exhibitorForm.set({
      id: 0,
      companyName: '',
      companyNameEn: '',
      boothNumber: '',
      published: false,
      sortOrder: 0,
      exhibitionId: 0,
    });
  }


  constructor() {
    this.loadExhibitions();
    this.loadExhibitors();
  }

  //행사 목록 조회
  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: (err) => console.error('전시회 목록 조회 실패:', err),
    });
  }
  
//참가업체 목록 조회
  loadExhibitors() {
    this.http.get<Exhibitor[]>('/api/exhibitor').subscribe({
      next: (res) => this.exhibitors.set(res),
      error: (err) => console.error('참가업체 조회 실패:', err),
    });
  }

  //참가업체 생성
  createExhibitor() {
    const data = this.exhibitorForm();
    if (!data.companyName || !data.exhibitionId) {
      alert('업체명과 전시회 선택은 필수입니다.');
      return;
    }

    const payload = {
      companyName: data.companyName,
      companyNameEn: data.companyNameEn,
      description: data.description,
      boothNumber: data.boothNumber,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      website: data.website,
      exhibitionId: data.exhibitionId,
    };

    this.http.post<Exhibitor>('/api/exhibitor', payload).subscribe({
      next: () => {
        this.loadExhibitors();
        this.resetForm();
      },
      error: (err) => console.error('참가업체 생성 실패:', err),
    });
  }


  //참가업체 목록 수정
  updateExhibitor() {
    const data = this.exhibitorForm();
    if (!data.companyName || !data.exhibitionId) {
      alert('업체명과 전시회 선택은 필수입니다.');
      return;
    }

    const payload = {
      companyName: data.companyName,
      companyNameEn: data.companyNameEn,
      description: data.description,
      boothNumber: data.boothNumber,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      website: data.website,
      exhibitionId: data.exhibitionId,
    };

    this.http.patch(`/api/exhibitor/${data.id}`, payload).subscribe({
      next: () => this.loadExhibitors(),
      error: (err) => console.error('참가업체 수정 실패:', err),
    });
  }

   
  
  //참가업체 목록 삭제

  deleteExhibitor(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/exhibitor/${id}`).subscribe({
      next: () => this.loadExhibitors(),
      error: (err) => console.error('참가업체 삭제 실패:', err),
    });
  }

  goBack() { this.router.navigate(['/']); }
}

