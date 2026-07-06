import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Exhibition {
  id: number;
  title: string;
}

export interface Exhibitor {
  id: number;
  companyName: string;
  companyNameEn?: string;
  description?: string;
  descriptionEn?: string;
  boothNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logoUrl?: string;
  published?: boolean;

  exhibitionId?: number;
  exhibition?: Exhibition;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-exhibitor',
  imports: [AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './exhibitor.page.html'
})
export class ExhibitorPage {
  private http = inject(HttpClient);
  router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  exhibitors = signal<Exhibitor[]>([]);
  exhibitions = signal<Exhibition[]>([]);

  exhibitionOptions = computed(() =>
    this.exhibitions().map(e => ({ label: e.title, value: String(e.id) }))
  );

  pg = useClientPagination({
    items: this.exhibitors,
    filterFn: (e, kw) =>
      e.companyName.toLowerCase().includes(kw) ||
      (e.boothNumber ?? '').toLowerCase().includes(kw) ||
      (e.contactEmail ?? '').toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'exhibitionId', label: '전시회',
        options: this.exhibitionOptions,
        filterFn: (e, v) => String(e.exhibitionId) === v,
      },
    ],
    manualSearch: true,
    pageSize: 3,
  });

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
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadExhibitors();
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  loadExhibitors() {
    this.http.get<Exhibitor[]>('/api/exhibitor?all=true').subscribe({
      next: (res) => this.exhibitors.set(res),
      error: handleApiError(this.toast, '참가업체 목록 조회 실패'),
    });
  }

  async deleteExhibitor(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/exhibitor/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadExhibitors(); },
      error: handleApiError(this.toast, '참가업체 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/exhibitor/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadExhibitors(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }
}
