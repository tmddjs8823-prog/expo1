import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Faq, FaqCategory } from './faq.page';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-faq-detail',
  imports: [FormsModule],
  templateUrl: './faq-detail.page.html',
})
export class FaqDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);

  faqId = Number(this.route.snapshot.paramMap.get('id'));
  question = signal('');
  answer = signal('');
  selectedCategoryId = signal<number | null>(null);
  categories = signal<FaqCategory[]>([]);
  published = signal(false);

  constructor() {
    this.loadFaq();
    this.loadCategories();
  }

  loadFaq() {
    this.http.get<Faq>(`/api/faq/${this.faqId}`).subscribe({
      next: (res) => {
        this.question.set(res.question);
        this.answer.set(res.answer);
        this.selectedCategoryId.set(res.categoryId);
        this.published.set(res.published);
      },
      error: handleApiError(this.toast, 'FAQ 조회 실패'),
    });
  }

  loadCategories() {
    this.http.get<FaqCategory[]>('/api/faq/category').subscribe({
      next: (res) => this.categories.set(res),
      error: handleApiError(this.toast, '카테고리 조회 실패'),
    });
  }

  updateFaq() {
    this.http.patch(`/api/faq/${this.faqId}`, {
      question: this.question(),
      answer: this.answer(),
      categoryId: this.selectedCategoryId(),
      published: this.published(),
    }).subscribe({
      next: () => { this.toast.success('답변이 등록되었습니다.'); this.router.navigate(['/faq']); },
      error: handleApiError(this.toast, 'FAQ 수정 실패'),
    });
  }

  deleteFaq() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/faq/${this.faqId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/faq']); },
      error: handleApiError(this.toast, 'FAQ 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/faq']);
  }
}
