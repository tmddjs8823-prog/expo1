import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError, handleDeleteError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Exhibition } from './exhibition.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useImageUpload } from '../../shared/utils/image-upload.utils';

@Component({
  selector: 'app-exhibition-detail',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './exhibition-detail.page.html',
})
export class ExhibitionDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private supabase = inject(SupabaseService);

  isCreateMode = this.route.snapshot.paramMap.get('id') === 'new';
  exhibitionId = this.isCreateMode ? 0 : Number(this.route.snapshot.paramMap.get('id'));
  exhibitionForm = signal<Exhibition>({
    id: 0,
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    startDate: '',
    endDate: '',
    venue: '',
    imageUrl: '',
    linkUrl: '',
    status: 'DRAFT',
    published: true,
  });
  selectedFile = signal<File | null>(null);

  // 이미지 업로드 (공통 유틸)
  private imgUpload = useImageUpload(this.supabase, 'LSG');
  uploading = this.imgUpload.uploading;

  startDate = signal('');
  startHour = signal('00');
  startMinute = signal('00');
  endDate = signal('');
  endHour = signal('00');
  endMinute = signal('00');

  hours24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  constructor() {
    if (!this.isCreateMode) {
      this.loadExhibition();
    }
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

  loadExhibition() {
    this.http.get<Exhibition>(`/api/exhibition/${this.exhibitionId}`).subscribe({
      next: (res) => {
        this.exhibitionForm.set({ ...res });
        const s = new Date(res.startDate);
        this.startDate.set(this.toLocalDateStr(s));
        this.startHour.set(String(s.getHours()).padStart(2, '0'));
        this.startMinute.set(String(Math.round(s.getMinutes() / 5) * 5).padStart(2, '0'));
        const e = new Date(res.endDate);
        this.endDate.set(this.toLocalDateStr(e));
        this.endHour.set(String(e.getHours()).padStart(2, '0'));
        this.endMinute.set(String(Math.round(e.getMinutes() / 5) * 5).padStart(2, '0'));
      },
      error: handleApiError(this.toast, '전시회 조회 실패'),
    });
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

  async save() {
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

    if (this.isCreateMode) {
      // 클라이언트 사이드 제목 중복 체크 (API 호출 전)
      const existing = await this.http
        .get<Exhibition[]>('/api/exhibition?all=true')
        .toPromise();
      const titleTrimmed = data.title.trim().toLowerCase();
      const duplicate = existing?.find(
        (e) => e.title.trim().toLowerCase() === titleTrimmed
      );
      if (duplicate) {
        this.toast.error(`동일한 제목의 전시회가 이미 존재합니다. (제목: "${duplicate.title}")`);
        return;
      }
    }

    const imageUrl = await this.uploadImage();
    const payload: Record<string, unknown> = {
      title: data.title,
      startDate: startIso,
      endDate: endIso,
      status: data.status,
      published: data.published,
      titleEn: data.titleEn?.trim() || null,
      description: data.description?.trim() || null,
      descriptionEn: data.descriptionEn?.trim() || null,
      venue: data.venue?.trim() || null,
      linkUrl: data.linkUrl?.trim() || null,
    };
    if (imageUrl && !imageUrl.startsWith('blob:')) payload['imageUrl'] = imageUrl;

    if (this.isCreateMode) {
      this.http.post('/api/exhibition', payload).subscribe({
        next: () => { this.toast.success('생성되었습니다.'); this.router.navigate(['/exhibition']); },
        error: (err) => {
          // 서버에서 409 Conflict 반환 시 (혹시 동시 생성 시 발생할 수 있음)
          if (err?.status === 409) {
            this.toast.error(err?.error?.message ?? '동일한 제목의 전시회가 이미 존재합니다.');
          } else {
            handleApiError(this.toast, '전시회 생성 실패')(err);
          }
        },
      });
    } else {
      this.http.patch(`/api/exhibition/${this.exhibitionId}`, payload).subscribe({
        next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/exhibition']); },
        error: handleApiError(this.toast, '전시회 수정 실패'),
      });
    }
  }


  async deleteExhibition() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/exhibition/${this.exhibitionId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/exhibition']); },
      error: handleDeleteError(this.confirmDialog, '전시회 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/exhibition']);
  }

  async resetForm() {
    const ok = await this.confirmDialog.open({ message: '입력한 내용을 초기화하시겠습니까?' });
    if (!ok) return;
    if (this.isCreateMode) {
      this.exhibitionForm.set({
        id: 0,
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        startDate: '',
        endDate: '',
        venue: '',
        imageUrl: '',
        linkUrl: '',
        status: 'DRAFT',
        published: true,
      });
      this.startDate.set('');
      this.startHour.set('00');
      this.startMinute.set('00');
      this.endDate.set('');
      this.endHour.set('00');
      this.endMinute.set('00');
      this.imgUpload.selectedFile.set(null);
    }
  }
}
