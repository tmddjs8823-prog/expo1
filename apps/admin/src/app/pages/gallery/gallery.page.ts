import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Gallery {
  id: number;
  title: string;

  description?: string;
  imageUrl: string;

  category?: string;
  published: boolean;

  exhibitionId?: number;
  exhibition?: { id: number; title: string; startDate: string; endDate: string };
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-gallery',
  imports: [AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './gallery.page.html'
})
export class GalleryPage {
  private http = inject(HttpClient);
  router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  galleries = signal<Gallery[]>([]);
  exhibitions = signal<{ id: number; title: string }[]>([]);

  exhibitionOptions = computed(() =>
    this.exhibitions().map(e => ({ label: e.title, value: String(e.id) }))
  );

  pg = useClientPagination({
    items: this.galleries,
    filterFn: (g, kw) =>
      g.title.toLowerCase().includes(kw) ||
      (g.description ?? '').toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'exhibitionId', label: '전시회',
        options: this.exhibitionOptions,
        filterFn: (g, v) => String(g.exhibitionId) === v,
      },
      {
        key: 'published', label: '공개여부',
        options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
        filterFn: (g, v) => String(g.published) === v,
      },
    ],
    manualSearch: true,
    pageSize: 3,
  });

  private readonly columnDefs: ColumnDef<Gallery>[] = [
    { header: '미리보기', field: 'imageUrl', type: 'image', imageClass: 'w-32 h-16 object-cover rounded' },
    { header: '제목', field: 'title', truncate: true, title: (g) => g.title },
    { header: '카테고리', render: (g) => g.category ?? '-' },
    { header: '전시회', render: (g) => g.exhibition?.title ?? '-', truncate: true, title: (g) => g.exhibition?.title ?? '-' },
    {
      header: '공개',
      type: 'badge',
      render: (g) => g.published ? '공개' : '비공개',
      badgeClass: (g) => g.published ? 'text-green-600' : 'text-red-500',
    },
    { header: '작성일', field: 'createdAt', type: 'date' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (g) => this.deleteGallery(g.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Gallery> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '제목, 설명으로 검색',
    emptyMessage: '등록된 갤러리가 없습니다.',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadGalleries();
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<{ id: number; title: string }[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  loadGalleries() {
    this.http.get<Gallery[]>('/api/gallery?all=true').subscribe({
      next: (res) => this.galleries.set(res),
      error: handleApiError(this.toast, '갤러리 조회 실패'),
    });
  }

  async deleteGallery(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/gallery/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadGalleries(); },
      error: handleApiError(this.toast, '갤러리 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/gallery/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadGalleries(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }
}
