import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface MyInquiry {
  id: number;
  subject: string;
  content: string;
  answer: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-my-inquiry',
  imports: [RouterModule],
  templateUrl: './my-inquiry.page.html',
})
export class MyInquiryPage {
  private http = inject(HttpClient);

  inquiries = signal<MyInquiry[]>([]);
  loading = signal(true);
  expandedId = signal<number | null>(null);

  constructor() {
    this.loadInquiries();
  }

  loadInquiries() {
    this.http.get<MyInquiry[]>('/api/inquiry/my').subscribe({
      next: (res) => {
        this.inquiries.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  getStatusLabel(status: string): string {
    return status === 'ANSWERED' ? '답변 완료' : '대기 중';
  }

  getStatusColor(status: string): string {
    return status === 'ANSWERED'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-amber-100 text-amber-700';
  }
}
