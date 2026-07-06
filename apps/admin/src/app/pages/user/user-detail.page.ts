import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError, handleDeleteError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { AppDetailFieldsComponent, DetailField } from '../../shared/detail-fields/detail-fields.component';

interface UserDetail {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  status: string;
  provider?: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
  inquiries: { id: number; subject: string; status: string; createdAt: string }[];
}

@Component({
  selector: 'app-user-detail',
  imports: [FormsModule, AppDetailFieldsComponent, PageHeaderComponent, DatePipe, RouterModule],
  templateUrl: './user-detail.page.html',
})
export class UserDetailPage {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private datePipe = inject(DatePipe);

  userId = Number(this.route.snapshot.paramMap.get('id'));
  user = signal<UserDetail | null>(null);
  selectedRole = signal('');
  selectedStatus = signal('');

  detailFields = computed<DetailField[]>(() => {
    const u = this.user();
    if (!u) return [];
    const fields: DetailField[] = [
      { label: '아이디', value: u.username },
      { label: '이름', value: u.name },
      { label: '이메일', value: u.email },
      { label: '역할', value: u.role === 'ADMIN' ? '관리자' : '일반' },
      { label: '상태', value: this.userStatusLabel(u.status) },
      { label: '가입방식', value: u.provider ? `${u.provider} (${u.providerId})` : '이메일' },
      { label: '가입일', value: this.datePipe.transform(u.createdAt, 'yyyy-MM-dd HH:mm') ?? '' },
      { label: '최근 수정', value: this.datePipe.transform(u.updatedAt, 'yyyy-MM-dd HH:mm') ?? '' },
      { label: '문의 수', value: String(u.inquiries.length) },
    ];
    return fields;
  });

  constructor() {
    this.loadUser();
  }

  loadUser() {
    this.http.get<UserDetail>(`/api/user/${this.userId}`).subscribe({
      next: (res) => {
        this.user.set(res);
        this.selectedRole.set(res.role);
        this.selectedStatus.set(res.status);
      },
      error: handleApiError(this.toast, '계정 조회 실패'),
    });
  }

  changeRole() {
    this.http.patch(`/api/user/${this.userId}/role`, {
      role: this.selectedRole(),
    }).subscribe({
      next: () => { this.toast.success('역할이 변경되었습니다.'); this.router.navigate(['/user']); },
      error: handleDeleteError(this.confirmDialog, '역할 변경 실패'),
    });
  }

  changeStatus() {
    this.http.patch(`/api/user/${this.userId}/status`, {
      status: this.selectedStatus(),
    }).subscribe({
      next: () => { this.toast.success('상태가 변경되었습니다.'); this.router.navigate(['/user']); },
      error: handleDeleteError(this.confirmDialog, '상태 변경 실패'),
    });
  }

  userStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return '활성';
      case 'SUSPENDED': return '정지';
      case 'DELETED': return '삭제';
      default: return status;
    }
  }

  async deleteUser() {
    const ok = await this.confirmDialog.open({ message: '이 계정을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/user/${this.userId}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/user']); },
      error: handleDeleteError(this.confirmDialog, '계정 삭제 실패'),
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return '대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '종료';
      default: return status;
    }
  }

  goBack() {
    this.router.navigate(['/user']);
  }
}
