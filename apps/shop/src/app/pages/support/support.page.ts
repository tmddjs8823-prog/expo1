import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

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
  selector: 'app-support',
  imports: [FormsModule, DatePipe],
  templateUrl: './support.page.html'
})
export class SupportPage {
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
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
}
