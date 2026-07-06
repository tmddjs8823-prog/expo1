import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Programs {
  id: number
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  speaker?: string
  speakerEn?: string
  startTime: string
  endTime: string
  exhibitionId?: number
  exhibition?: { id: number; title: string }
  published?: boolean

  createdAt?: Date
  updatedAt?: Date
}

@Component({
  selector: 'app-program',
  imports: [AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './program.page.html'
})
export class ProgramPage {
  private http = inject(HttpClient);
  router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  programs = signal<Programs[]>([]);
  exhibitions = signal<{ id: number; title: string }[]>([]);

  exhibitionOptions = computed(() =>
    this.exhibitions().map(e => ({ label: e.title, value: String(e.id) }))
  );

  pg = useClientPagination({
    items: this.programs,
    filterFn: (p, kw) =>
      p.title.toLowerCase().includes(kw) ||
      (p.speaker ?? '').toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'published', label: '공개여부',
        options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
        filterFn: (p, v) => String(p.published) === v,
      },
      {
        key: 'exhibitionId', label: '전시회',
        options: this.exhibitionOptions,
        filterFn: (p, v) => String(p.exhibitionId) === v,
      },
    ],
    manualSearch: true,
    pageSize: 3,
  });

  searchKeyword = this.pg.searchKeyword;

  private readonly columnDefs: ColumnDef<Programs>[] = [
    { header: '전시회', render: (p) => p.exhibition?.title ?? '-', truncate: true, title: (p) => p.exhibition?.title ?? '-' },
    { header: '제목', field: 'title', truncate: true, title: (p) => p.title },
    { header: '시작시간', field: 'startTime', type: 'date', dateFormat: 'yy-MM-dd HH:mm' },
    { header: '종료시간', field: 'endTime', type: 'date', dateFormat: 'yy-MM-dd HH:mm' },
    {
      header: '공개',
      type: 'badge',
      render: (p) => p.published ? '공개' : '비공개',
      badgeClass: (p) => p.published ? 'text-green-600' : 'text-red-500',
    },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (p) => this.deletePrograms(p.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Programs> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '제목, 발표자로 검색',
    emptyMessage: '등록된 프로그램이 없습니다.',
    minWidth: '800px',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadprograms();
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<{ id: number; title: string }[]>('/api/exhibition/slim').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  loadprograms() {
    this.http.get<Programs[]>('/api/program?all=true').subscribe({
      next: (res) => this.programs.set(res),
      error: handleApiError(this.toast, '프로그램 목록 조회 실패'),
    });
  }

  async deletePrograms(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/program/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadprograms(); },
      error: handleApiError(this.toast, '프로그램 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 항목을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/program/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 항목이 삭제되었습니다.`); this.loadprograms(); },
      error: handleApiError(this.toast, '일괄 삭제 실패'),
    });
  }
}
