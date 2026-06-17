import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Exhibition } from './exhibition.page';

@Component({
  selector: 'app-exhibition-detail',
  imports: [FormsModule],
  templateUrl: './exhibition-detail.page.html',
})
export class ExhibitionDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
    status: 'DRAFT',
    published: false,
  });

  constructor() {
    this.loadExhibition();
  }

  loadExhibition() {
    this.http.get<Exhibition>(`/api/exhibition/${this.exhibitionId}`).subscribe({
      next: (res) => {
        this.exhibitionForm.set({
          ...res,
          startDate: res.startDate.slice(0, 16),
          endDate: res.endDate.slice(0, 16),
        });
      },
      error: (err) => console.error('전시회 조회 실패:', err),
    });
  }

  validateForm(): boolean {
    const form = this.exhibitionForm();
    if (!form.title || !form.startDate || !form.endDate) {
      alert('제목, 시작일, 종료일은 필수입니다.');
      return false;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      alert('종료일은 시작일보다 이후여야 합니다.');
      return false;
    }
    return true;
  }

  updateExhibition() {
    if (!this.validateForm()) return;
    const data = this.exhibitionForm();
    
    const payload = {
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      venue: data.venue,
      status: data.status,
      published: data.published,
    };

    this.http.patch(`/api/exhibition/${this.exhibitionId}`, payload).subscribe({
      next: () => this.router.navigate(['/exhibition']),
      error: (err) => console.error('전시회 수정 실패:', err),
    });
  }

  deleteExhibition() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/exhibition/${this.exhibitionId}`).subscribe({
      next: () => this.router.navigate(['/exhibition']),
      error: (err) => console.error('전시회 삭제 실패:', err),
    });
  }

  goBack() {
    this.router.navigate(['/exhibition']);
  }
}
