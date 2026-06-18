import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PreRegistration } from './preregistration.page';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-preregistration-detail',
  imports: [DatePipe],
  templateUrl: './preregistration-detail.page.html',
})
export class PreregistrationDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);

  regId = Number(this.route.snapshot.paramMap.get('id'));
  registration = signal<PreRegistration | null>(null);

  constructor() {
    this.loadRegistration();
  }

  loadRegistration() {
    this.http.get<PreRegistration>(`/api/preregistration/${this.regId}`).subscribe({
      next: (res) => this.registration.set(res),
      error: (err) => { console.error('사전등록 조회 실패:', err); this.toast.error('사전등록 조회 실패'); },
    });
  }

  deleteRegistration() {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    this.http.delete(`/api/preregistration/${this.regId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/preregistration']); },
      error: (err) => { console.error('사전등록 삭제 실패:', err); this.toast.error('사전등록 삭제 실패'); },
    });
  }

  goBack() {
    this.router.navigate(['/preregistration']);
  }
}
