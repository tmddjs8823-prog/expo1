import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Notice } from './notice.page';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-notice-detail',
  imports: [FormsModule],
  templateUrl: './notice-detail.page.html',
})
export class NoticeDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);

  noticeId = Number(this.route.snapshot.paramMap.get('id'));
  title = signal('');
  content = signal('');
  published = signal(false);

  constructor() {
    this.loadNotice();
  }

  loadNotice() {
    this.http.get<Notice>(`/api/notice/${this.noticeId}`).subscribe({
      next: (res) => {
        this.title.set(res.title);
        this.content.set(res.content);
        this.published.set(res.published);
      },
      error: handleApiError(this.toast, '공지사항 조회 실패'),
    });
  }

  updateNotice() {
    this.http.patch(`/api/notice/${this.noticeId}`, {
      title: this.title(),
      content: this.content(),
      published: this.published(),
    }).subscribe({
      next: () => { this.toast.success('수정되었습니다.'); this.router.navigate(['/notice']); },
      error: handleApiError(this.toast, '공지사항 수정 실패'),
    });
  }

  deleteNotice() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/notice/${this.noticeId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/notice']); },
      error: handleApiError(this.toast, '공지사항 삭제 실패'),
    });
  }

  goBack() {
    this.router.navigate(['/notice']);
  }
}
