import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
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
  sortOrder?: number
  createdAt?: Date
  updatedAt?: Date
}

@Component({
  selector: 'app-program',
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './program.page.html'
})
export class ProgramPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  //시그널 초기상태 정리
  programs = signal<Programs[]>([]);
  exhibitions = signal<{ id: number; title: string }[]>([]);
  selectedProgramId = signal<number | null>(null);

  // 행사 옵션 (동적)
  exhibitionOptions = computed(() =>
    this.exhibitions().map(e => ({ label: e.title, value: String(e.id) }))
  );

  // 검색 + 페이지네이션 (공통 유틸리티)
  pg = useClientPagination({
    items: this.programs,
    filterFn: (p, kw) =>
      p.title.toLowerCase().includes(kw) ||
      (p.speaker ?? '').toLowerCase().includes(kw) ||
      (p.exhibition?.title ?? '').toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'published', label: '공개여부',
        options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
        filterFn: (p, v) => String(p.published) === v,
      },
      {
        key: 'exhibitionId', label: '행사',
        options: this.exhibitionOptions,
        filterFn: (p, v) => String(p.exhibitionId) === v,
      },
    ],
    manualSearch: true,
    pageSize: 3,
  });

  searchKeyword = this.pg.searchKeyword;

  private readonly columnDefs: ColumnDef<Programs>[] = [
    { header: '제목', field: 'title', truncate: true, title: (p) => p.title },
    { header: '시작시간', field: 'startTime', type: 'date', dateFormat: 'yy-MM-dd HH:mm' },
    { header: '종료시간', field: 'endTime', type: 'date', dateFormat: 'yy-MM-dd HH:mm' },
    { header: '전시회', render: (p) => p.exhibition?.title ?? '-', truncate: true, title: (p) => p.exhibition?.title ?? '-' },
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
    searchPlaceholder: '제목, 발표자, 전시회로 검색',
    emptyMessage: '등록된 프로그램이 없습니다.',
    minWidth: '800px',
    rowClickable: true,
    pagination: this.pg,
  };

  // 선택된 공지사항의 전체 데이터
  selectedPrograms = signal<Programs | null>(null);
  // 입력 폼 데이터
  programForm = signal<Programs>({
    id: 0,
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    speaker: '',
    speakerEn: '',
    startTime: '',
    endTime: '',
    exhibitionId: undefined,
    published: true,
    sortOrder: 0,
  });

  // 시간 선택용 시그널
  startDate = signal('');
  startHour = signal('00');
  startMinute = signal('00');
  endDate = signal('');
  endHour = signal('00');
  endMinute = signal('00');

  // 24시간 드롭다운 옵션
  hours24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  // constructor
  constructor() {
    this.loadprograms();
    this.loadExhibitions();
  }

  loadExhibitions() {
    this.http.get<{ id: number; title: string }[]>('/api/exhibition?all=true').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: handleApiError(this.toast, '전시회 목록 조회 실패'),
    });
  }

  // 날짜 + 시/분 → ISO 문자열 조합
  assembleDateTime(date: string, hour: string, minute: string): string {
    if (!date) return '';
    return new Date(`${date}T${hour}:${minute}:00`).toISOString();
  }

  //폼 초기화
  resetForm() {
    this.selectedProgramId.set(null);
    this.programForm.set({
          id: 0,
          title: '',
          titleEn: '',
          description: '',
          descriptionEn: '',
          speaker: '',
          speakerEn: '',
          startTime: '',
          endTime: '',
          exhibitionId: undefined,
          published: true,
          sortOrder: 0,
        });
    this.startDate.set('');
    this.startHour.set('00');
    this.startMinute.set('00');
    this.endDate.set('');
    this.endHour.set('00');
    this.endMinute.set('00');
  }
  

  // 전체 목록 조회
  loadprograms() {
    this.http.get<Programs[]>('/api/program?all=true').subscribe({
      next: (res) => this.programs.set(res),
      error: handleApiError(this.toast, '프로그램 목록 조회 실패'),
    }); 
  }

  // 선택 조회 → 폼에 데이터 채우기
  selectPrograms(id: number) {
    const program = this.programs().find(p => p.id === id);
    if (!program) return;
    this.selectedProgramId.set(id);
    this.programForm.set({ ...program });

    // 시간 시그널에 분해 (로컬 시간 기준)
    const s = new Date(program.startTime);
    this.startDate.set(this.toLocalDateStr(s));
    this.startHour.set(String(s.getHours()).padStart(2, '0'));
    this.startMinute.set(String(Math.round(s.getMinutes() / 5) * 5).padStart(2, '0'));

    const e = new Date(program.endTime);
    this.endDate.set(this.toLocalDateStr(e));
    this.endHour.set(String(e.getHours()).padStart(2, '0'));
    this.endMinute.set(String(Math.round(e.getMinutes() / 5) * 5).padStart(2, '0'));
  }

  // Date → yyyy-MM-dd (로컬 시간 기준)
  toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  //생성
  createProgram() {
    const data = this.programForm();
    const startIso = this.assembleDateTime(this.startDate(), this.startHour(), this.startMinute());
    const endIso = this.assembleDateTime(this.endDate(), this.endHour(), this.endMinute());

    if (!data.title || !startIso || !endIso) {
      this.toast.error('제목, 시작일, 종료일을 입력해주세요.');
      return;
    }
    if (new Date(endIso) <= new Date(startIso)) {
      this.toast.error('종료시간은 시작시간보다 이후여야 합니다.');
      return;
    }
    
    const payload: Record<string, unknown> = {
      title: data.title,
      startTime: startIso,
      endTime: endIso,
      published: data.published,
      sortOrder: data.sortOrder,
    };

    if (data.titleEn) payload['titleEn'] = data.titleEn;
    if (data.description) payload['description'] = data.description;
    if (data.descriptionEn) payload['descriptionEn'] = data.descriptionEn;
    if (data.speaker) payload['speaker'] = data.speaker;
    if (data.speakerEn) payload['speakerEn'] = data.speakerEn;
    if (data.exhibitionId) payload['exhibitionId'] = data.exhibitionId;

    this.http.post('/api/program', payload).subscribe({
      next: () => { 
        this.loadprograms(); 
        this.resetForm(); },
      error: handleApiError(this.toast, '프로그램 생성 실패'),
    });
  }

  // 수정
  updatePrograms() {
    const id = this.selectedProgramId();
    if (!id) return;
    
    const data = this.programForm();
    const startIso = this.assembleDateTime(this.startDate(), this.startHour(), this.startMinute());
    const endIso = this.assembleDateTime(this.endDate(), this.endHour(), this.endMinute());

    const payload: Record<string, unknown> = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      speaker: data.speaker,
      speakerEn: data.speakerEn,
      startTime: startIso,
      endTime: endIso,
      exhibitionId: data.exhibitionId || null,
      published: data.published,
      sortOrder: data.sortOrder,
    };

    this.http.patch(`/api/program/${id}`, payload).subscribe({
      next: () => {
        this.toast.success('프로그램이(가) 수정되었습니다.');
        this.loadprograms();
        this.resetForm();
      },
      error: handleApiError(this.toast, '프로그램 수정 실패'),
    });
  }

  // 삭제
  async deletePrograms(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/program/${id}`).subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadprograms();
        this.resetForm();
      },
      error: handleApiError(this.toast, '프로그램 삭제 실패'),
    });
  }

}
