import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Programs } from './program.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-program-detail',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './program-detail.page.html',
})
export class ProgramDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

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

  startDate = signal('');
  startHour = signal('09');
  startMinute = signal('00');
  endDate = signal('');
  endHour = signal('10');
  endMinute = signal('00');

  hours24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  constructor() {
    this.loadProgram();
  }

  assembleDateTime(date: string, hour: string, minute: string): string {
    if (!date) return '';
    return new Date(`${date}T${hour}:${minute}:00`).toISOString();
  }

  loadProgram() {
    this.http.get<Programs>(`/api/program/${this.programId}`).subscribe({
      next: (res) => {
        this.programForm.set({ ...res });
        const s = new Date(res.startTime);
        this.startDate.set(this.toLocalDateStr(s));
        this.startHour.set(String(s.getHours()).padStart(2, '0'));
        this.startMinute.set(String(Math.round(s.getMinutes() / 5) * 5).padStart(2, '0'));
        const e = new Date(res.endTime);
        this.endDate.set(this.toLocalDateStr(e));
        this.endHour.set(String(e.getHours()).padStart(2, '0'));
        this.endMinute.set(String(Math.round(e.getMinutes() / 5) * 5).padStart(2, '0'));
      },
      error: handleApiError(this.toast, '프로그램 조회 실패'),
    });
  }

  toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  updateProgram() {
    const data = this.programForm();
    const startIso = this.assembleDateTime(this.startDate(), this.startHour(), this.startMinute());
    const endIso = this.assembleDateTime(this.endDate(), this.endHour(), this.endMinute());

    if (!data.title || !startIso || !endIso) {
      this.toast.error('제목, 시작시간, 종료시간은 필수입니다.');
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

    this.http.patch(`/api/program/${this.programId}`, payload).subscribe({
      next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/program']); },
      error: handleApiError(this.toast, '프로그램 수정 실패'),
    });
  }

  async deleteProgram() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/program/${this.programId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/program']); },
      error: handleApiError(this.toast, '프로그램 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/program']);
  }
}
