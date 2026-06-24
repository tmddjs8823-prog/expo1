import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';


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
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './preregistration.page.html'
})
export class PreregistrationPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

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

  searchKeyword = this.pg.searchKeyword;

  private readonly columnDefs: ColumnDef<PreRegistration>[] = [
    { header: '이름', field: 'name' },
    { header: '이메일', field: 'email', truncate: true, title: (r) => r.email },
    { header: '전화번호', field: 'phone', truncate: true, title: (r) => r.phone },
    { header: '회사', field: 'company', truncate: true, title: (r) => r.company },
    { header: '직책', field: 'jobTitle' },
    { header: '전시회', render: (r) => r.exhibition?.title ?? '-', truncate: true, title: (r) => r.exhibition?.title ?? '-' },
    { header: '등록일', field: 'createdAt', type: 'date' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (r) => this.deletePreRegistration(r.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<PreRegistration> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '이름, 이메일, 회사, 전화번호로 검색',
    emptyMessage: '등록된 사전등록이 없습니다.',
    minWidth: '800px',
    rowClickable: true,
    pagination: this.pg,
  };
  
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
  async deletePreRegistration(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/preregistration/${id}`).subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadPreregistrations();
      },
      error: handleApiError(this.toast, '사전등록 삭제 실패')
    });
  }


}
