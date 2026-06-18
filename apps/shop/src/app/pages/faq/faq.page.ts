import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

export interface FaqCategory {
  id: number;
  name: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  published: boolean;
  categoryId: number;
  category?: FaqCategory;
  createdAt: string;
}

@Component({
  selector: 'app-faq',
  imports: [FormsModule, DatePipe, PaginationComponent],
  templateUrl: './faq.page.html'
})
export class FaqPage {
  private http = inject(HttpClient);

  faqs = signal<Faq[]>([]);
  categories = signal<FaqCategory[]>([]);
  searchKeyword = signal('');
  selectedCategoryId = signal<number | null>(null);
  expandedId = signal<number | null>(null);

  filteredFaqs = computed(() => {
    let list = this.faqs().filter(f => f.published);
    const catId = this.selectedCategoryId();
    if (catId) {
      list = list.filter(f => f.categoryId === catId);
    }
    const keyword = this.searchKeyword().toLowerCase();
    if (keyword) {
      list = list.filter(f =>
        f.question.toLowerCase().includes(keyword) ||
        f.answer.toLowerCase().includes(keyword) ||
        (f.category?.name ?? '').toLowerCase().includes(keyword)
      );
    }
    return list;
  });

  // 페이지네이션
  currentPage = signal(1);
  pageSize = 3;
  totalPages = computed(() => Math.ceil(this.filteredFaqs().length / this.pageSize));
  pagedFaqs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredFaqs().slice(start, start + this.pageSize);
  });

  constructor() {
    this.loadFaqs();
    this.loadCategories();
  }

  loadFaqs() {
    this.http.get<Faq[]>('/api/faq').subscribe({
      next: (res) => this.faqs.set(res),
      error: (err) => console.error('FAQ 조회 실패:', err),
    });
  }

  loadCategories() {
    this.http.get<FaqCategory[]>('/api/faq/category').subscribe({
      next: (res) => this.categories.set(res),
      error: (err) => console.error('카테고리 조회 실패:', err),
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.currentPage.set(1); // 카테고리 변경 시 1페이지로
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
}
