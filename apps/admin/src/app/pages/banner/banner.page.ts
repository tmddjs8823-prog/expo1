import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { useImageUpload } from '../../shared/utils/image-upload.utils';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  published: boolean;
  sortOrder: number;
  exhibitionId?: number;
  exhibition?: { id: number; title: string; startDate: string; endDate: string };
  createdAt: string;
}

@Component({
  selector: 'app-banner',
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './banner.page.html',
})
export class BannerPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private supabase = inject(SupabaseService);

  banners = signal<Banner[]>([]);
  exhibitions = signal<{ id: number; title: string }[]>([]);

  // 행사 옵션 (동적)
  exhibitionOptions = computed(() =>
    this.exhibitions().map(e => ({ label: e.title, value: String(e.id) }))
  );

  // 검색 + 필터링 (공통 유틸리티 — 페이지네이션 미사용)
  pg = useClientPagination({
    items: this.banners,
    filterFn: (b, kw) => b.title.toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'exhibitionId', label: '행사',
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

  searchKeyword = this.pg.searchKeyword;
  filteredBanners = this.pg.filtered;

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
    { header: '행사', render: (b) => b.exhibition?.title ?? '-', truncate: true, title: (b) => b.exhibition?.title ?? '-' },
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
  };

  // 폼
  title = signal('');
  subtitle = signal('');
  linkUrl = signal('');
  published = signal(true);
  sortOrder = signal(1);
  selectedBannerId = signal<number | null>(null);
  isEditing = signal(false);
  exhibitionId = signal<number | null>(null);

  // 이미지 업로드 (공통 유틸)
  private imgUpload = useImageUpload(this.supabase, 'LSG');
  imageUrl = this.imgUpload.imageUrl;
  uploading = this.imgUpload.uploading;
  selectedFile = this.imgUpload.selectedFile;
  onFileSelected = this.imgUpload.onFileSelected.bind(this.imgUpload);

  constructor() {
    this.loadBanners();
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<{ id: number; title: string }[]>('/api/exhibition?all=true').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  resetForm() {
    this.title.set('');
    this.subtitle.set('');
    this.linkUrl.set('');
    this.published.set(true);
    this.sortOrder.set(1);
    this.selectedBannerId.set(null);
    this.isEditing.set(false);
    this.exhibitionId.set(null);
    this.imgUpload.reset();
  }

  loadBanners() {
    this.http.get<Banner[]>('/api/banner?all=true').subscribe({
      next: (res) => this.banners.set(res),
      error: handleApiError(this.toast, '배너 조회 실패'),
    });
  }

  async createBanner() {
    const url = await this.imgUpload.upload();
    if (!url) { this.toast.error('이미지를 등록해주세요.'); return; }
    if (!this.title()) { this.toast.error('제목을 입력해주세요.'); return; }

    this.http.post('/api/banner', {
      title: this.title(),
      subtitle: this.subtitle()?.trim() || null,
      imageUrl: url,
      linkUrl: this.linkUrl()?.trim() || null,
      published: this.published(),
      sortOrder: this.sortOrder(),
      exhibitionId: this.exhibitionId() || undefined,
    }).subscribe({
      next: () => { this.toast.success('배너가 생성되었습니다.'); this.loadBanners(); this.resetForm(); },
      error: handleApiError(this.toast, '배너 생성 실패'),
    });
  }

  editBanner(banner: Banner) {
    this.selectedBannerId.set(banner.id);
    this.title.set(banner.title);
    this.subtitle.set(banner.subtitle ?? '');
    this.imageUrl.set(banner.imageUrl);
    this.linkUrl.set(banner.linkUrl ?? '');
    this.published.set(banner.published);
    this.sortOrder.set(banner.sortOrder);
    this.exhibitionId.set(banner.exhibitionId ?? null);
    this.isEditing.set(true);
  }

  async updateBanner() {
    const id = this.selectedBannerId();
    if (!id) return;
    const url = await this.imgUpload.upload();

    this.http.patch(`/api/banner/${id}`, {
      title: this.title(),
      subtitle: this.subtitle()?.trim() || null,
      imageUrl: url ?? this.imageUrl(),
      linkUrl: this.linkUrl()?.trim() || null,
      published: this.published(),
      sortOrder: this.sortOrder(),
      exhibitionId: this.exhibitionId() || undefined,
    }).subscribe({
      next: () => { this.toast.success('배너가 수정되었습니다.'); this.loadBanners(); this.resetForm(); },
      error: handleApiError(this.toast, '배너 수정 실패'),
    });
  }

  async deleteBanner(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/banner/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadBanners(); },
      error: handleApiError(this.toast, '배너 삭제 실패'),
    });
  }
}
