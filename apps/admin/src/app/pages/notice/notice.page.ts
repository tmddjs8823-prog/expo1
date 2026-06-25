import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error.utils';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDataGridComponent, ColumnDef, DataGridOption } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

export interface Notice {
  id : number ;
  title : string ;
  createdAt : Date;
  content: string;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
  authorId : number;

}

// 시그널 폼 상태 초기화

@Component({
  selector: 'app-notice',
  imports: [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './notice.page.html',
})
export class NoticePage{private http = 
  inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

notices = signal<Notice[]>([]);
selectedNoticeId = signal<number | null>(null);
title = signal ('');
content = signal('');
isEditing = signal(false);
published = signal(true);

// 검색 + 페이지네이션 (공통 유틸리티)
pg = useClientPagination({
  items: this.notices,
  filterFn: (n, kw) =>
    n.title.toLowerCase().includes(kw) ||
    n.content.toLowerCase().includes(kw),
  filterDefs: [
    {
      key: 'published', label: '공개여부',
      options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
      filterFn: (n, v) => String(n.published) === v,
    },
  ],
  manualSearch: true,
  pageSize: 3,
});

  private readonly columnDefs: ColumnDef<Notice>[] = [
    { header: '제목', field: 'title', truncate: true, title: (n) => n.title },
    {
      header: '공개여부',
      type: 'badge',
      render: (n) => n.published ? '공개' : '비공개',
      badgeClass: (n) => n.published ? 'text-green-600' : 'text-red-500',
    },
    { header: '작성일', field: 'createdAt', type: 'date' },
    {
      header: '관리',
      actions: [
        { label: '삭제', class: 'text-red-600 hover:underline', onClick: (n) => this.deleteNotice(n.id) },
      ],
    },
  ];

  readonly gridOption: DataGridOption<Notice> = {
    columnDefs: this.columnDefs,
    searchPlaceholder: '제목, 내용으로 검색',
    emptyMessage: '등록된 공지사항이 없습니다.',
    rowClickable: true,
    pagination: this.pg,
  };

// 상태 목록 초기화
constructor(){
  this.loadNotice();
}


// 폼 초기화 항목
resetForm(){
  this.title.set('');
  this.content.set('');
  this.isEditing.set(false);
  this.selectedNoticeId.set(null);
  this.published.set(true);
}

loadNotice(){
  this.http.get<Notice[]>('/api/notice?all=true')
    .subscribe({
      next: (res)=> {
        this.notices.set(res); 
      },
      error: handleApiError(this.toast, '공지사항 목록 조회 실패')
    });
}

// 생성모드

createNotice() {
  this.http.post('/api/notice',{
    title : this.title(),
    content : this.content(),
    published: this.published(),
  }).subscribe({
    next :()=>{ 
      this.toast.success('공지사항이 생성되었습니다.');
      this.loadNotice();
      this.resetForm();
    },
    error: handleApiError(this.toast, '공지사항 생성 실패')
    })
}

//수정모드 버튼 누를시 데이터 바운딩
editNotice(notice : Notice) {

  this.selectedNoticeId.set(notice.id);
  this.title.set(notice.title);
  this.content.set(notice.content);
  this.published.set(notice.published);
  this.isEditing.set(true);
}


//수정버튼 누른후 데이터 로드
updateNotice() {
  this.http.patch(`/api/notice/${this.selectedNoticeId()}`,{
    title : this.title(),
    content : this.content(),
    published: this.published(),
  })
    .subscribe({
      next: () => {
        this.toast.success('공지사항이 수정되었습니다.');
        this.loadNotice();
        this.resetForm();
      },
      error: handleApiError(this.toast, '공지사항 수정 실패')
    })
  }

async deleteNotice(id : number) {
  const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
  this.http.delete(`/api/notice/${id}`)
    .subscribe({
      next: ()=> {
        this.toast.warning('삭제되었습니다.');
        this.loadNotice();
        this.resetForm();
      },
      error: handleApiError(this.toast, '공지사항 삭제 실패')
    })
}
}

  
