import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError, handleDeleteError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Faq, FaqCategory } from './faq.page';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-faq-detail',
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './faq-detail.page.html',
})
export class FaqDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  isCreateMode = this.route.snapshot.paramMap.get('id') === 'new';
  faqId = this.isCreateMode ? 0 : Number(this.route.snapshot.paramMap.get('id'));
  question = signal('');
  answer = signal('');
  selectedCategoryId = signal<number | null>(null);
  categories = signal<FaqCategory[]>([]);
  published = signal(true);

  // 카테고리 관리
  showNewCategory = signal(false);
  newCategoryName = signal('');

  constructor() {
    if (!this.isCreateMode) {
      this.loadFaq();
    }
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

  createCategory() {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.http.post<FaqCategory>('/api/faq/category', { name }).subscribe({
      next: () => {
        this.toast.success('카테고리가 추가되었습니다.');
        this.loadCategories();
        this.newCategoryName.set('');
        this.showNewCategory.set(false);
      },
      error: handleApiError(this.toast, '카테고리 생성 실패'),
    });
  }

  async deleteCategory(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 카테고리를 삭제할까요?' });
    if (!ok) return;
    this.http.delete(`/api/faq/category/${id}`).subscribe({
      next: () => { this.toast.warning('카테고리가 삭제되었습니다.'); this.loadCategories(); },
      error: handleDeleteError(this.confirmDialog, '카테고리 삭제 실패'),
    });
  }

  save() {
    const payload = {
      question: this.question(),
      answer: this.answer(),
      categoryId: this.selectedCategoryId(),
      published: this.published(),
    };

    if (this.isCreateMode) {
      this.http.post('/api/faq', payload).subscribe({
        next: () => { this.toast.success('생성되었습니다.'); this.router.navigate(['/faq']); },
        error: handleApiError(this.toast, 'FAQ 생성 실패'),
      });
    } else {
      this.http.patch(`/api/faq/${this.faqId}`, payload).subscribe({
        next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/faq']); },
        error: handleApiError(this.toast, 'FAQ 수정 실패'),
      });
    }
  }

  async deleteFaq() {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/faq/${this.faqId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/faq']); },
      error: handleDeleteError(this.confirmDialog, 'FAQ 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/faq']);
  }

  async resetForm() {
    const ok = await this.confirmDialog.open({ message: '입력한 내용을 초기화하시겠습니까?' });
    if (!ok) return;
    if (this.isCreateMode) {
      this.question.set('');
      this.answer.set('');
      this.selectedCategoryId.set(null);
      this.published.set(true);
    }
  }
}
