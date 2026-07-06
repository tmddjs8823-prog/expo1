import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  published: boolean;
  sortOrder: number;
  exhibitionId?: number;
  exhibition?: { id: number; title: string };
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-banner',
  imports: [AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './banner.page.html'
})
export class BannerPage {
  private http = inject(HttpClient);
  router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  banners = signal<Banner[]>([]);
  exhibitions = signal<{ id: number; title: string }[]>([]);

  exhibitionOptions = computed(() =>
    this.exhibitions().map(e => ({ label: e.title, value: String(e.id) }))
  );

  pg = useClientPagination({
    items: this.banners,
    filterFn: (b, kw) => b.title.toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'exhibitionId', label: '전시회',
        options: this.exhibitionOptions,
        filterFn: (b, v) => String(b.exhibitionId) === v,
      },
      {
        key: 'published', label: '공개여부',
        options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
        filterFn: (b, v) => String(b.published) === v,
      },
    ],
    manualSearch: true,
  });

  private readonly columnDefs: ColumnDef<Banner>[] = [
    { header: '미리보기', field: 'imageUrl', type: 'image', imageClass: 'w-32 h-16 object-cover rounded' },
    { header: '제목', field: 'title', truncate: true, title: (b) => b.title },
    {
      header: '공개',
      type: 'badge',
      render: (b) => b.published ? '공개' : '비공개',
      badgeClass: (b) => b.published ? 'text-green-600' : 'text-red-500',
    },
    { header: '순서', field: 'sortOrder' },
    { header: '전시회', render: (b) => b.exhibition?.title ?? '-', truncate: true, title: (b) => b.exhibition?.title ?? '-' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (b) => this.deleteBanner(b.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Banner> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '제목으로 검색',
    emptyMessage: '등록된 배너가 없습니다.',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadBanners();
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<{ id: number; title: string }[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  loadBanners() {
    this.http.get<Banner[]>('/api/banner?all=true').subscribe({
      next: (res) => this.banners.set(res),
      error: handleApiError(this.toast, '배너 조회 실패'),
    });
  }

  async deleteBanner(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/banner/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadBanners(); },
      error: handleApiError(this.toast, '배너 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/banner/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadBanners(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }
}
