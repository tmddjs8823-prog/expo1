import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { ToastService } from '../../shared/toast/toast.service';

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
  location: string
  published?: boolean
  sortOrder?: number
  createdAt?: Date
  updatedAt?: Date
}

@Component({
  selector: 'app-program',
  imports: [FormsModule, DatePipe, PaginationComponent],
  templateUrl: './program.page.html'
})
export class ProgramPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);

  //시그널 초기상태 정리
  programs = signal<Programs[]>([]);
  searchKeyword = signal('');
  filteredPrograms = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.programs();
    return this.programs().filter(p =>
      p.title.toLowerCase().includes(keyword) ||
      (p.speaker ?? '').toLowerCase().includes(keyword) ||
      (p.location ?? '').toLowerCase().includes(keyword)
    );
  });
  selectedProgramId = signal<number | null>(null);

  // 페이지네이션
  currentPage = signal(1);
  pageSize = 3;
  totalPages = computed(() => Math.ceil(this.filteredPrograms().length / this.pageSize));
  pagedPrograms = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPrograms().slice(start, start + this.pageSize);
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

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
    location: '',
    published: false,
    sortOrder: 0,
  });

  // 시간 선택용 시그널
  startDate = signal('');
  startHour = signal('09');
  startMinute = signal('00');
  endDate = signal('');
  endHour = signal('10');
  endMinute = signal('00');

  // 24시간 드롭다운 옵션
  hours24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  // constructor
  constructor() {
    this.loadprograms();
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
          location: '',
          published: false,
          sortOrder: 0,
        });
    this.startDate.set('');
    this.startHour.set('09');
    this.startMinute.set('00');
    this.endDate.set('');
    this.endHour.set('10');
    this.endMinute.set('00');
  }
  

  // 전체 목록 조회
  loadprograms() {
    this.http.get<Programs[]>('/api/program').subscribe({
      next: (res) => this.programs.set(res),
      error: (err) => { console.error('프로그램 목록 조회 실패:', err); this.toast.error('프로그램 목록 조회 실패'); },
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
    
    const payload = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      speaker: data.speaker,
      speakerEn: data.speakerEn,
      startTime: startIso,
      endTime: endIso,
      location: data.location,
      published: data.published,
      sortOrder: data.sortOrder,
    };

    this.http.post('/api/program', payload).subscribe({
      next: () => { 
        this.loadprograms(); 
        this.resetForm(); },
      error: (err) => { console.error('프로그램 생성 실패:', err); this.toast.error('프로그램 생성 실패'); },
    });
  }

  // 수정
  updatePrograms() {
    const id = this.selectedProgramId();
    if (!id) return;
    
    const data = this.programForm();
    const startIso = this.assembleDateTime(this.startDate(), this.startHour(), this.startMinute());
    const endIso = this.assembleDateTime(this.endDate(), this.endHour(), this.endMinute());

    const payload = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      speaker: data.speaker,
      speakerEn: data.speakerEn,
      startTime: startIso,
      endTime: endIso,
      location: data.location,
      published: data.published,
      sortOrder: data.sortOrder,
    };

    this.http.patch(`/api/program/${id}`, payload).subscribe({
      next: () => {
        this.toast.success('프로그램이(가) 수정되었습니다.');
        this.loadprograms();
        this.resetForm();
      },
      error: (err) => { console.error('프로그램 수정 실패:', err); this.toast.error('프로그램 수정 실패'); },
    });
  }

  // 삭제
  deletePrograms(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/program/${id}`).subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadprograms();
        this.resetForm();
      },
      error: (err) => { console.error('프로그램 삭제 실패:', err); this.toast.error('프로그램 삭제 실패'); },
    });
  }

}
