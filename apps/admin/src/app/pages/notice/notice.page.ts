import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../shared/utils/api-error';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AdminDataGridComponent, GridRowDef } from '../../shared/data-grid/data-grid.component';
import { ToastService } from '../../shared/toast/toast.service';
import { useClientPagination } from '../../shared/utils/pagination.utils';

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
  imports: [FormsModule, DatePipe, AdminDataGridComponent, GridRowDef],
  templateUrl: './notice.page.html',
})
export class NoticePage{private http = 
  inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);

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
  pageSize: 3,
});

// 템플릿 바인딩용 alias
searchKeyword = this.pg.searchKeyword;
currentPage = this.pg.currentPage;
totalPages = this.pg.totalPages;
pagedNotices = this.pg.paged;
onPageChange = this.pg.onPageChange;





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

deleteNotice(id : number) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
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

  
