import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Notice } from '../notice/notice.page';

@Component({
  selector: 'app-notice-detail',
  imports: [RouterModule, DatePipe],
  templateUrl: './notice-detail.page.html',
})
export class NoticeDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  notice = signal<Notice | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Notice>(`/api/notice/${id}`).subscribe({
        next: (res) => {
          if (!res.published) {
            this.notice.set(null);
          } else {
            this.notice.set(res);
          }
        },
        error: (err) => console.error('공지사항 조회 실패:', err),
      });
    }
  }
}
