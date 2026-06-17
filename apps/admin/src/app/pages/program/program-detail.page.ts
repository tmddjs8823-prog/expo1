import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Programs } from './program.page';

@Component({
  selector: 'app-program-detail',
  imports: [FormsModule],
  templateUrl: './program-detail.page.html',
})
export class ProgramDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  programId = Number(this.route.snapshot.paramMap.get('id'));
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

  constructor() {
    this.loadProgram();
  }

  loadProgram() {
    this.http.get<Programs>(`/api/program/${this.programId}`).subscribe({
      next: (res) => {
        this.programForm.set({
          ...res,
          startTime: res.startTime.slice(0, 16),
          endTime: res.endTime.slice(0, 16),
        });
      },
      error: (err) => console.error('프로그램 조회 실패:', err),
    });
  }

  // 날짜 입력 검증 (20xx년만 허용)
  updateDateTime(field: 'startTime' | 'endTime', value: string) {
    const year = value.split('-')[0];
    if (year && (year.length > 4 || !year.startsWith('2'))) return;
    this.programForm.update(f => ({ ...f, [field]: value }));
  }

  // 시간 유효성 검증
  validateTime(): boolean {
    const form = this.programForm();
    if (!form.title || !form.startTime || !form.endTime) {
      alert('제목, 시작시간, 종료시간은 필수입니다.');
      return false;
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      alert('종료시간은 시작시간보다 이후여야 합니다.');
      return false;
    }
    const startYear = new Date(form.startTime).getFullYear();
    const endYear = new Date(form.endTime).getFullYear();
    if (startYear < 2000 || startYear > 2099 || endYear < 2000 || endYear > 2099) {
      alert('올바른 시간을 입력해주세요.');
      return false;
    }
    return true;
  }

  updateProgram() {
    if (!this.validateTime()) return;
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

    this.http.patch(`/api/program/${this.programId}`, payload).subscribe({
      next: () => this.router.navigate(['/program']),
      error: (err) => console.error('프로그램 수정 실패:', err),
    });
  }

  deleteProgram() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/program/${this.programId}`).subscribe({
      next: () => this.router.navigate(['/program']),
      error: (err) => console.error('프로그램 삭제 실패:', err),
    });
  }

  goBack() {
    this.router.navigate(['/program']);
  }
}
