import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Exhibition } from '../exhibition/exhibition.page';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

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
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './exhibitor.page.html'
})
export class ExhibitorPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  //초기 시그널 폼 정의
  exhibitors = signal<Exhibitor[]>([]);
  exhibitions = signal<Exhibition[]>([]);

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.exhibitors,
    filterFn: (e, kw) =>
      e.companyName.toLowerCase().includes(kw) ||
      (e.boothNumber ?? '').toLowerCase().includes(kw) ||
      (e.contactEmail ?? '').toLowerCase().includes(kw) ||
      (e.exhibition?.title ?? '').toLowerCase().includes(kw),
    pageSize: 3,
  });

  searchKeyword = this.pg.searchKeyword;

  private readonly columnDefs: ColumnDef<Exhibitor>[] = [
    { header: '전시회', render: (e) => e.exhibition?.title ?? '-', truncate: true, title: (e) => e.exhibition?.title ?? '-' },
    { header: '업체명', field: 'companyName', truncate: true, title: (e) => e.companyName },
    { header: '부스번호', field: 'boothNumber', truncate: true, title: (e) => e.boothNumber ?? '' },
    { header: '이메일', field: 'contactEmail', truncate: true, title: (e) => e.contactEmail ?? '' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (e) => this.deleteExhibitor(e.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Exhibitor> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '업체명, 부스번호, 이메일로 검색',
    emptyMessage: '등록된 참가업체가 없습니다.',
    rowClickable: true,
    pagination: this.pg,
  };
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
    this.http.get<Exhibition[]>('/api/exhibition?all=true').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }
  
//참가업체 목록 조회
  loadExhibitors() {
    this.http.get<Exhibitor[]>('/api/exhibitor').subscribe({
      next: (res) => this.exhibitors.set(res),
      error: handleApiError(this.toast, '참가업체 조회 실패'),
    });
  }

  //참가업체 생성
  createExhibitor() {
    const data = this.exhibitorForm();
    if (!data.companyName || !data.exhibitionId) {
      this.toast.error('업체명과 전시회 선택은 필수입니다.');
      return;
    }

    const payload: Record<string, unknown> = {
      companyName: data.companyName,
      exhibitionId: Number(data.exhibitionId),
    };

    if (data.companyNameEn) payload['companyNameEn'] = data.companyNameEn;
    if (data.description) payload['description'] = data.description;
    if (data.boothNumber) payload['boothNumber'] = data.boothNumber;
    if (data.contactEmail) payload['contactEmail'] = data.contactEmail;
    if (data.contactPhone) payload['contactPhone'] = data.contactPhone;
    if (data.website) payload['website'] = data.website;

    this.http.post<Exhibitor>('/api/exhibitor', payload).subscribe({
      next: () => {
        this.toast.success('참가업체이(가) 생성되었습니다.');
        this.loadExhibitors();
        this.resetForm();
      },
      error: handleApiError(this.toast, '참가업체 생성 실패'),
    });
  }


  //참가업체 목록 수정
  updateExhibitor() {
    const data = this.exhibitorForm();
    if (!data.companyName || !data.exhibitionId) {
      this.toast.error('업체명과 전시회 선택은 필수입니다.');
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
      exhibitionId: Number(data.exhibitionId),
    };

    this.http.patch(`/api/exhibitor/${data.id}`, payload).subscribe({
      next: () => { this.toast.success('수정되었습니다.'); this.loadExhibitors(); },
      error: handleApiError(this.toast, '참가업체 수정 실패'),
    });
  }

   
  
  //참가업체 목록 삭제

  async deleteExhibitor(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/exhibitor/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadExhibitors(); },
      error: handleApiError(this.toast, '참가업체 삭제 실패'),
    });
  }

  goBack() { this.router.navigate(['/']); }
}

