import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

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
  imports: [FormsModule, DatePipe],
  templateUrl: './program.page.html'
})
export class ProgramPage {
  private http = inject(HttpClient);
  router = inject(Router);

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

  // constructor
  constructor() {
    this.loadprograms();
  }

  // 날짜 입력 검증 (20xx년만 허용)
  updateDateTime(field: 'startTime' | 'endTime', value: string) {
    const year = value.split('-')[0];
    if (year && (year.length > 4 || !year.startsWith('2'))) return;
    this.programForm.update(f => ({ ...f, [field]: value }));
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
  }
  

  // 전체 목록 조회
  loadprograms() {
    this.http.get<Programs[]>('/api/program').subscribe({
      next: (res) => this.programs.set(res),
      error: (err) => console.error('프로그램 목록 조회 실패:', err),
    }); 
  }

  // 선택 조회 → 폼에 데이터 채우기
  selectPrograms(id: number) {
    const program = this.programs().find(p => p.id === id);
    if (!program) return;
    this.selectedProgramId.set(id);
    this.programForm.set({
      ...program,
      startTime: program.startTime.slice(0, 16),
      endTime: program.endTime.slice(0, 16),
    });
  }
  
  //생성
  createProgram() {
    const data = this.programForm();
    if (!data.title || !data.startTime || !data.endTime) {
      alert('올바른 시간을 입력해주세요.');
      return;
    }
    const startYear = new Date(data.startTime).getFullYear();
    const endYear = new Date(data.endTime).getFullYear();
    if (startYear < 2000 || startYear > 2099 || endYear < 2000 || endYear > 2099) {
      alert('올바른 시간을 입력해주세요.');
      return;
    }
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      alert('종료시간은 시작시간보다 이후여야 합니다.');
      return;
    }
    
    const payload = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      speaker: data.speaker,
      speakerEn: data.speakerEn,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      location: data.location,
      published: data.published,
      sortOrder: data.sortOrder,
    };

    this.http.post('/api/program', payload).subscribe({
      next: () => { 
        this.loadprograms(); 
        this.resetForm(); },
      error: (err) => console.error('프로그램 생성 실패:', err),
    });
  }

  // 수정
  updatePrograms() {
    const id = this.selectedProgramId();
    if (!id) return;
    
    const data = this.programForm();
    const payload = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      speaker: data.speaker,
      speakerEn: data.speakerEn,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      location: data.location,
      published: data.published,
      sortOrder: data.sortOrder,
    };

    this.http.patch(`/api/program/${id}`, payload).subscribe({
      next: () => {
        this.loadprograms();
        this.resetForm();
      },
      error: (err) => console.error('프로그램 수정 실패:', err),
    });
  }

  // 삭제
  deletePrograms(id: number) {
    this.http.delete(`/api/program/${id}`).subscribe({
      next: () => {
        this.loadprograms();
        this.resetForm();
      },
      error: (err) => console.error('프로그램 삭제 실패:', err),
    });
  }

}
