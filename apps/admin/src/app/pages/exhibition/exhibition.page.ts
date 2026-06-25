import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { useImageUpload } from '../../shared/utils/image-upload.utils';

export interface Exhibition {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  imageUrl?: string;
  linkUrl?: string;
  status: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-exhibition',
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './exhibition.page.html',
})
export class ExhibitionPage {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  exhibitions = signal<Exhibition[]>([]);
  private statusOrder: Record<string, number> = { PUBLISHED: 0, DRAFT: 1, CLOSED: 2 };

  // 상태 정렬된 시그널 (useClientPagination에 전달)
  private sortedExhibitions = computed(() =>
    [...this.exhibitions()].sort((a, b) =>
      (this.statusOrder[a.status] ?? 9) - (this.statusOrder[b.status] ?? 9)
    )
  );

  // 상태 한글 매핑
  private statusKo: Record<string, string[]> = {
    DRAFT: ['예정'],
    PUBLISHED: ['진행중', '진행 중'],
    CLOSED: ['종료'],
  };

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.sortedExhibitions,
    filterFn: (e, kw) =>
      e.title.toLowerCase().includes(kw) ||
      (e.venue ?? '').toLowerCase().includes(kw) ||
      e.status.toLowerCase().includes(kw) ||
      (this.statusKo[e.status] ?? []).some(label => label.includes(kw)),
    filterDefs: [
      {
        key: 'status', label: '상태',
        options: [
          { label: '예정', value: 'DRAFT' },
          { label: '진행중', value: 'PUBLISHED' },
          { label: '종료', value: 'CLOSED' },
        ],
        filterFn: (e, v) => e.status === v,
      },
    ],
    dateRangeFilter: {
      label: '행사일정',
      getStartDate: (e) => e.startDate,
      getEndDate: (e) => e.endDate,
    },
    manualSearch: true,
    pageSize: 3,
  });

  searchKeyword = this.pg.searchKeyword;

  private statusLabel(status: string): string {
    switch (status) {
      case 'DRAFT': return '예정';
      case 'PUBLISHED': return '진행중';
      case 'CLOSED': return '종료';
      default: return status;
    }
  }

  private statusClass(status: string): string {
    switch (status) {
      case 'DRAFT': return 'text-blue-600';
      case 'PUBLISHED': return 'text-green-600';
      case 'CLOSED': return 'text-red-500';
      default: return '';
    }
  }

  private readonly columnDefs: ColumnDef<Exhibition>[] = [
    { header: '제목', field: 'title', truncate: true, title: (e) => e.title },
    { header: '장소', field: 'venue', truncate: true, title: (e) => e.venue ?? '' },
    { header: '시작일', field: 'startDate', type: 'date' },
    { header: '종료일', field: 'endDate', type: 'date' },
    {
      header: '상태',
      type: 'badge',
      render: (e) => this.statusLabel(e.status),
      badgeClass: (e) => this.statusClass(e.status),
    },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (e) => this.deleteExhibition(e.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Exhibition> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '제목, 장소, 상태(예정/진행중/종료)로 검색',
    emptyMessage: '등록된 전시회가 없습니다.',
    minWidth: '800px',
    rowClickable: true,
    pagination: this.pg,
  };

  exhibitionForm = signal<Exhibition>({
    id: 0, title: '', titleEn: '', description: '', descriptionEn: '',
    startDate: '', endDate: '', venue: '', imageUrl: '', linkUrl: '',
    status: 'DRAFT', published: true,
  });

  // 이미지 업로드 (공통 유틸)
  private imgUpload = useImageUpload(this.supabase, 'LSG');
  uploading = this.imgUpload.uploading;

  // 시간 선택용 시그널
  startDate = signal('');
  startHour = signal('00');
  startMinute = signal('00');
  endDate = signal('');
  endHour = signal('00');
  endMinute = signal('00');

  // 24시간 드롭다운 옵션
  hours24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  constructor() {
    this.loadExhibitions();
  }

  resetForm() {
    this.exhibitionForm.set({
      id: 0, title: '', titleEn: '', description: '', descriptionEn: '',
      startDate: '', endDate: '', venue: '', imageUrl: '', linkUrl: '',
      status: 'DRAFT', published: false,
    });
    this.imgUpload.reset();
    this.startDate.set(''); this.startHour.set('00'); this.startMinute.set('00');
    this.endDate.set(''); this.endHour.set('00'); this.endMinute.set('00');
  }

  assembleDateTime(date: string, hour: string, minute: string): string {
    if (!date) return '';
    return new Date(`${date}T${hour}:${minute}:00`).toISOString();
  }

  toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imgUpload.selectedFile.set(file);
      this.exhibitionForm.update(f => ({ ...f, imageUrl: URL.createObjectURL(file) }));
    }
  }

  async uploadImage(): Promise<string | null> {
    const file = this.imgUpload.selectedFile();
    if (!file) return this.exhibitionForm().imageUrl || null;
    return await this.imgUpload.upload();
  }

  loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition?all=true').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  async createExhibition() {
    const data = this.exhibitionForm();
    const startIso = this.assembleDateTime(this.startDate(), this.startHour(), this.startMinute());
    const endIso = this.assembleDateTime(this.endDate(), this.endHour(), this.endMinute());

    if (!data.title || !startIso || !endIso) {
      this.toast.error('제목, 시작일, 종료일은 필수입니다.');
      return;
    }
    if (new Date(endIso) <= new Date(startIso)) {
      this.toast.error('종료일은 시작일보다 이후여야 합니다.');
      return;
    }

    const imageUrl = await this.uploadImage();

    const payload: Record<string, unknown> = {
      title: data.title,
      startDate: startIso,
      endDate: endIso,
      status: data.status,
      published: data.published,
    };

    // 빈 문자열이 아닌 값만 포함
    if (data.titleEn) payload['titleEn'] = data.titleEn;
    if (data.description) payload['description'] = data.description;
    if (data.descriptionEn) payload['descriptionEn'] = data.descriptionEn;
    if (data.venue) payload['venue'] = data.venue;
    if (data.linkUrl) payload['linkUrl'] = data.linkUrl;
    if (imageUrl && !imageUrl.startsWith('blob:')) payload['imageUrl'] = imageUrl;

    this.http.post('/api/exhibition', payload).subscribe({
      next: () => {
        this.toast.success('전시회이(가) 생성되었습니다.');
        this.loadExhibitions();
        this.resetForm();
      },
      error: handleApiError(this.toast, '전시회 생성 실패'),
    });
  }

  async deleteExhibition(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/exhibition/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadExhibitions(); },
      error: (err) => {
        const msg = err?.error?.message || '전시회 삭제 실패';
        this.confirmDialog.alert({
          title: '삭제 불가',
          message: msg,
          variant: 'warning',
        });
      },
    });
  }
}
