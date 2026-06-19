import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDataGridComponent, GridRowDef } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';


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
  exhibitionId?: number;
  exhibition?: { id: number; title: string };
}

@Component({
  selector: 'app-preregistration',
  imports: [FormsModule, DatePipe, AdminDataGridComponent, GridRowDef],
  templateUrl: './preregistration.page.html'
})
export class PreregistrationPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);

  //시그널 초기 상태 정의
  preRegistrations = signal<PreRegistration[]>([]);
  selectedPreRegistrationId = signal<number | null>(null);

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.preRegistrations,
    filterFn: (r, kw) =>
      r.name.toLowerCase().includes(kw) ||
      r.email.toLowerCase().includes(kw) ||
      (r.company ?? '').toLowerCase().includes(kw) ||
      (r.phone ?? '').toLowerCase().includes(kw),
    pageSize: 3,
  });

  // 템플릿 바인딩용 alias
  searchKeyword = this.pg.searchKeyword;
  currentPage = this.pg.currentPage;
  totalPages = this.pg.totalPages;
  pagedPreRegistrations = this.pg.paged;
  onPageChange = this.pg.onPageChange;
  
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
      error: handleApiError(this.toast, '사전등록 조회 실패')
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
      error: handleApiError(this.toast, '사전등록 삭제 실패')
    });
  }


}
