import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError, handleDeleteError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface User {
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
  _count?: { inquiries: number };
}

@Component({
  selector: 'app-user',
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './user.page.html',
})
export class UserPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  users = signal<User[]>([]);

  pg = useClientPagination({
    items: this.users,
    filterFn: (u, kw) =>
      u.username.toLowerCase().includes(kw),
    filterDefs: [
      {
        key: 'role', label: '역할',
        options: [
          { label: '일반', value: 'USER' },
          { label: '관리자', value: 'ADMIN' },
        ],
        filterFn: (u, v) => u.role === v,
      },
      {
        key: 'provider', label: '가입방식',
        options: [
          { label: '이메일', value: 'EMAIL' },
          { label: '카카오', value: 'KAKAO' },
        ],
        filterFn: (u, v) => v === 'EMAIL' ? !u.provider : u.provider === v,
      },
      {
        key: 'status', label: '상태',
        options: [
          { label: '활성', value: 'ACTIVE' },
          { label: '정지', value: 'SUSPENDED' },
          { label: '삭제', value: 'DELETED' },
        ],
        filterFn: (u, v) => u.status === v,
      },
    ],
    manualSearch: true,
    pageSize: 10,
  });

  private roleLabel(role: string): string {
    return role === 'ADMIN' ? '관리자' : '일반';
  }

  private roleClass(role: string): string {
    return role === 'ADMIN' ? 'text-purple-600' : 'text-slate-600';
  }

  private providerLabel(user: User): string {
    if (!user.provider) return '이메일';
    return user.provider === 'KAKAO' ? '카카오' : user.provider;
  }

  private providerClass(user: User): string {
    return user.provider === 'KAKAO' ? 'text-amber-600' : 'text-blue-600';
  }

  private statusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return '활성';
      case 'SUSPENDED': return '정지';
      case 'DELETED': return '삭제';
      default: return status;
    }
  }

  private statusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'SUSPENDED': return 'text-amber-600';
      case 'DELETED': return 'text-red-600';
      default: return '';
    }
  }

  private readonly columnDefs: ColumnDef<User>[] = [
    { header: '아이디', field: 'username' },
    {
      header: '역할',
      type: 'badge',
      render: (u) => this.roleLabel(u.role),
      badgeClass: (u) => this.roleClass(u.role),
    },
    {
      header: '가입방식',
      type: 'badge',
      render: (u) => this.providerLabel(u),
      badgeClass: (u) => this.providerClass(u),
    },
    {
      header: '상태',
      type: 'badge',
      render: (u) => this.statusLabel(u.status),
      badgeClass: (u) => this.statusClass(u.status),
    },
    { header: '가입일', field: 'createdAt', type: 'date' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (u) => this.deleteUser(u.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<User> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '아이디, 이름으로 검색',
    emptyMessage: '등록된 계정이 없습니다.',
    rowClickable: true,
    pagination: this.pg,
    bulkActions: {
      label: '선택 삭제',
      onClick: (ids) => this.bulkDelete(ids as number[]),
    },
  };

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<User[]>('/api/user').subscribe({
      next: (res) => this.users.set(res),
      error: handleApiError(this.toast, '계정 목록 조회 실패'),
    });
  }

  async deleteUser(id: number) {
    const ok = await this.confirmDialog.open({ message: '이 계정을 삭제하면 되돌릴 수 없습니다.' });
    if (!ok) return;
    this.http.delete(`/api/user/${id}`).subscribe({
      next: () => { this.toast.warning('삭제되었습니다.'); this.loadUsers(); },
      error: handleDeleteError(this.confirmDialog, '계정 삭제 실패'),
    });
  }

  async bulkDelete(ids: number[]) {
    const ok = await this.confirmDialog.open({ message: `선택한 ${ids.length}개 계정을 삭제하면 되돌릴 수 없습니다.` });
    if (!ok) return;
    this.http.delete('/api/user/bulk', { body: { ids } }).subscribe({
      next: () => { this.toast.warning(`${ids.length}개 계정이 삭제되었습니다.`); this.loadUsers(); },
      error: handleDeleteError(this.confirmDialog, '일괄 삭제 실패'),
    });
  }
}
