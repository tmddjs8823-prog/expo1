import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { ToastService } from '../../shared/toast/toast.service';


export interface PreRegistration {
  id: number;     
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  createdAt: string;
  updatedAt: string;
  agreeTerms: boolean;
  agreeMarketing: boolean; 
}

@Component({
  selector: 'app-preregistration',
  imports: [FormsModule, DatePipe, PaginationComponent],
  templateUrl: './preregistration.page.html'
})
export class PreregistrationPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);

  //시그널 초기 상태 정의
  preRegistrations = signal<PreRegistration[]>([]);
  searchKeyword = signal('');
  filteredPreRegistrations = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.preRegistrations();
    return this.preRegistrations().filter(r =>
      r.name.toLowerCase().includes(keyword) ||
      r.email.toLowerCase().includes(keyword) ||
      (r.company ?? '').toLowerCase().includes(keyword) ||
      (r.phone ?? '').toLowerCase().includes(keyword)
    );
  });
  selectedPreRegistrationId = signal<number | null>(null);

  // 페이지네이션
  currentPage = signal(1);
  pageSize = 3;
  totalPages = computed(() => Math.ceil(this.filteredPreRegistrations().length / this.pageSize));
  pagedPreRegistrations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPreRegistrations().slice(start, start + this.pageSize);
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
  
  //상태 목록 초기화
  constructor() {
    this.loadPreregistrations();
  }

  //전체 조회
  loadPreregistrations() {
    this.http.get<PreRegistration[]>("/api/preregistration").subscribe({
      next: (response) => {
        this.preRegistrations.set(response);
      },
      error: (err) => { console.error('사전등록 조회 실패:', err); this.toast.error('사전등록 조회 실패'); }
    });
  }
  
  //선택 조회
  selectPreRegistration(id: number) {
    this.selectedPreRegistrationId.set(id);
  }
  //선택 삭제
  deletePreRegistration(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/preregistration/${id}`).subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadPreregistrations();
      },
      error: (err) => { console.error('사전등록 삭제 실패:', err); this.toast.error('사전등록 삭제 실패'); }
    });
  }


}
