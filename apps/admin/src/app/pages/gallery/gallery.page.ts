import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { useImageUpload } from '../../shared/utils/image-upload.utils';

export interface Gallery {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  published: boolean;
  sortOrder: number;
  exhibitionId?: number;
  exhibition?: { id: number; title: string; startDate: string; endDate: string };
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-gallery',
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './gallery.page.html'
})
export class GalleryPage {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  // 시그널 초기상태
  galleries = signal<Gallery[]>([]);
  exhibitions = signal<{ id: number; title: string }[]>([]);
  title = signal('');
  description = signal('');
  selectedGalleryId = signal<number | null>(null);
  isEditing = signal(false);
  published = signal(true);
  exhibitionId = signal<number | null>(null);

  // 행사 옵션 (동적)
  exhibitionOptions = computed(() =>
    this.exhibitions().map(e => ({ label: e.title, value: String(e.id) }))
  );

  // 이미지 업로드 (공통 유틸)
  private imgUpload = useImageUpload(this.supabase, 'LSG');
  imageUrl = this.imgUpload.imageUrl;
  uploading = this.imgUpload.uploading;
  selectedFile = this.imgUpload.selectedFile;
  onFileSelected = this.imgUpload.onFileSelected.bind(this.imgUpload);

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.galleries,
    filterFn: (g, kw) =>
      g.title.toLowerCase().includes(kw) ||
      (g.description ?? '').toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'exhibitionId', label: '행사',
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

  searchKeyword = this.pg.searchKeyword;

  private readonly columnDefs: ColumnDef<Gallery>[] = [
    { header: '미리보기', field: 'imageUrl', type: 'image' },
    { header: '제목', field: 'title', truncate: true, title: (g) => g.title },
    {
      header: '공개여부',
      type: 'badge',
      render: (g) => g.published ? '공개' : '비공개',
      badgeClass: (g) => g.published ? 'text-green-600' : 'text-red-500',
    },
    { header: '행사', render: (g) => g.exhibition?.title ?? '-', truncate: true, title: (g) => g.exhibition?.title ?? '-' },
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
  };

  constructor() {
    this.loadGalleries();
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
    this.description.set('');
    this.selectedGalleryId.set(null);
    this.isEditing.set(false);
    this.published.set(true);
    this.exhibitionId.set(null);
    this.imgUpload.reset();
  }

  loadGalleries() {
    this.http.get<Gallery[]>('/api/gallery?all=true').subscribe({
      next: (res) => this.galleries.set(res),
      error: handleApiError(this.toast, '갤러리 목록 조회 실패'),
    });
  }

  async createGallery() {
    if (!this.title().trim()) {
      this.toast.error('제목을 입력해주세요.');
      return;
    }
    if (!this.selectedFile() && !this.imageUrl()) {
      this.toast.error('이미지를 선택해주세요.');
      return;
    }

    const url = await this.imgUpload.upload();
    if (!url) return;

    this.http.post('/api/gallery', {
      title: this.title(),
      description: this.description(),
      imageUrl: url,
      published: this.published(),
      exhibitionId: this.exhibitionId() || undefined,
    }).subscribe({
      next: () => {
        this.toast.success('갤러리이(가) 생성되었습니다.');
        this.loadGalleries();
        this.resetForm();
      },
      error: handleApiError(this.toast, '갤러리 생성 실패'),
    });
  }

  editGallery(gallery: Gallery) {
    this.selectedGalleryId.set(gallery.id);
    this.title.set(gallery.title);
    this.description.set(gallery.description ?? '');
    this.imageUrl.set(gallery.imageUrl);
    this.published.set(gallery.published);
    this.exhibitionId.set(gallery.exhibitionId ?? null);
    this.isEditing.set(true);
  }

  async updateGallery() {
    const url = await this.imgUpload.upload();

    this.http.patch(`/api/gallery/${this.selectedGalleryId()}`, {
      title: this.title(),
      description: this.description(),
      imageUrl: url || this.imageUrl(),
      published: this.published(),
      exhibitionId: this.exhibitionId() || undefined,
    }).subscribe({
      next: () => {
        this.toast.success('갤러리이(가) 수정되었습니다.');
        this.loadGalleries();
        this.resetForm();
      },
      error: handleApiError(this.toast, '갤러리 수정 실패'),
    });
  }

  async deleteGallery(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/gallery/${id}`).subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadGalleries();
        this.resetForm();
      },
      error: handleApiError(this.toast, '갤러리 삭제 실패'),
    });
  }
}
