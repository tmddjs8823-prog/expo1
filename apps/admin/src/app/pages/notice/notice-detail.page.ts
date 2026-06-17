import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Notice } from './notice.page';

@Component({
  selector: 'app-notice-detail',
  imports: [FormsModule],
  templateUrl: './notice-detail.page.html',
})
export class NoticeDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  noticeId = Number(this.route.snapshot.paramMap.get('id'));
  title = signal('');
  content = signal('');

  constructor() {
    this.loadNotice();
  }

  loadNotice() {
    this.http.get<Notice>(`/api/notice/${this.noticeId}`).subscribe({
      next: (res) => {
        this.title.set(res.title);
        this.content.set(res.content);
      },
      error: (err) => console.error('공지사항 조회 실패:', err),
    });
  }

  updateNotice() {
    this.http.patch(`/api/notice/${this.noticeId}`, {
      title: this.title(),
      content: this.content(),
    }).subscribe({
      next: () => this.router.navigate(['/notice']),
      error: (err) => console.error('공지사항 수정 실패:', err),
    });
  }

  deleteNotice() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/notice/${this.noticeId}`).subscribe({
      next: () => this.router.navigate(['/notice']),
      error: (err) => console.error('공지사항 삭제 실패:', err),
    });
  }

  goBack() {
    this.router.navigate(['/notice']);
  }
}
