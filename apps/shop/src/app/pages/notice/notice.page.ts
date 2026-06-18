import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

export interface Notice {
  id: number;
  title: string;
  content: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  authorId: number;
}

@Component({
  selector: 'app-notice',
  imports: [RouterModule, FormsModule, DatePipe, PaginationComponent],
  templateUrl: './notice.page.html',
})
export class NoticePage {
  private http = inject(HttpClient);

  notices = signal<Notice[]>([]);
  searchKeyword = signal('');

  filteredNotices = computed(() => {
    let list = this.notices().filter(n => n.published);
    const keyword = this.searchKeyword().toLowerCase();
    if (keyword) {
      list = list.filter(n =>
        n.title.toLowerCase().includes(keyword) ||
        n.content.toLowerCase().includes(keyword)
      );
    }
    return list;
  });

  // 페이지네이션
  currentPage = signal(1);
  pageSize = 10;
  totalPages = computed(() => Math.ceil(this.filteredNotices().length / this.pageSize));
  pagedNotices = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredNotices().slice(start, start + this.pageSize);
  });

  constructor() {
    this.loadNotices();
  }

  loadNotices() {
    this.http.get<Notice[]>('/api/notice').subscribe({
      next: (res) => this.notices.set(res),
      error: (err) => console.error('공지사항 조회 실패:', err),
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
