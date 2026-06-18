import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Exhibition } from './exhibition.page';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-exhibition-detail',
  imports: [FormsModule],
  templateUrl: './exhibition-detail.page.html',
})
export class ExhibitionDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  private supabase = inject(SupabaseService);

  exhibitionId = Number(this.route.snapshot.paramMap.get('id'));
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
    published: false,
  });
  selectedFile = signal<File | null>(null);
  uploading = signal(false);

  // 시간 선택용 시그널
  startDate = signal('');
  startHour = signal('09');
  startMinute = signal('00');
  endDate = signal('');
  endHour = signal('18');
  endMinute = signal('00');

  // 24시간 드롭다운 옵션
  hours24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  constructor() {
    this.loadExhibition();
  }

  // 날짜 + 시/분 → ISO 문자열 조합
  assembleDateTime(date: string, hour: string, minute: string): string {
    if (!date) return '';
    return new Date(`${date}T${hour}:${minute}:00`).toISOString();
  }

  // Date → yyyy-MM-dd (로컬 시간 기준)
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

        // 로컬 시간 기준으로 분해
        const s = new Date(res.startDate);
        this.startDate.set(this.toLocalDateStr(s));
        this.startHour.set(String(s.getHours()).padStart(2, '0'));
        this.startMinute.set(String(Math.round(s.getMinutes() / 5) * 5).padStart(2, '0'));

        const e = new Date(res.endDate);
        this.endDate.set(this.toLocalDateStr(e));
        this.endHour.set(String(e.getHours()).padStart(2, '0'));
        this.endMinute.set(String(Math.round(e.getMinutes() / 5) * 5).padStart(2, '0'));
      },
      error: (err) => { console.error('전시회 조회 실패:', err); this.toast.error('전시회 조회 실패'); },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.exhibitionForm.update(f => ({ ...f, imageUrl: URL.createObjectURL(file) }));
    }
  }

  async uploadImage(): Promise<string | null> {
    const file = this.selectedFile();
    if (!file) return this.exhibitionForm().imageUrl || null;
    this.uploading.set(true);
    try {
      return await this.supabase.uploadImage('LSG', file);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      return null;
    } finally {
      this.uploading.set(false);
    }
  }

  async updateExhibition() {
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

    if (data.titleEn) payload['titleEn'] = data.titleEn;
    if (data.description) payload['description'] = data.description;
    if (data.descriptionEn) payload['descriptionEn'] = data.descriptionEn;
    if (data.venue) payload['venue'] = data.venue;
    if (data.linkUrl) payload['linkUrl'] = data.linkUrl;
    if (imageUrl && !imageUrl.startsWith('blob:')) payload['imageUrl'] = imageUrl;

    this.http.patch(`/api/exhibition/${this.exhibitionId}`, payload).subscribe({
      next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/exhibition']); },
      error: (err) => { console.error('전시회 수정 실패:', err); this.toast.error('전시회 수정 실패'); },
    });
  }

  deleteExhibition() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/exhibition/${this.exhibitionId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/exhibition']); },
      error: (err) => { console.error('전시회 삭제 실패:', err); this.toast.error('전시회 삭제 실패'); },
    });
  }

  goBack() {
    this.router.navigate(['/exhibition']);
  }
}
