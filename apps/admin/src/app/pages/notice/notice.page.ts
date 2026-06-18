import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { ToastService } from '../../shared/toast/toast.service';

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
  imports: [FormsModule, DatePipe, PaginationComponent],
  templateUrl: './notice.page.html',
})
export class NoticePage{private http = 
  inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);

notices = signal<Notice[]>([]);
searchKeyword = signal('');
filteredNotices = computed(() => {
  const keyword = this.searchKeyword().toLowerCase();
  if (!keyword) return this.notices();
  return this.notices().filter(n =>
    n.title.toLowerCase().includes(keyword) ||
    n.content.toLowerCase().includes(keyword)
  );
});
selectedNoticeId = signal<number | null>(null);
title = signal ('');
content = signal('');
isEditing = signal(false);
published = signal(true);

// 페이지네이션
currentPage = signal(1);
pageSize = 3;
totalPages = computed(() => Math.ceil(this.filteredNotices().length / this.pageSize));
pagedNotices = computed(() => {
  const start = (this.currentPage() - 1) * this.pageSize;
  return this.filteredNotices().slice(start, start + this.pageSize);
});

onPageChange(page: number) {
  this.currentPage.set(page);
}





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
  this.http.get<Notice[]>('/api/notice')
    .subscribe({
      next: (res)=> {
        this.notices.set(res); 
      },
      error: (err) => { console.error('Error fetching notices:', err); this.toast.error('Error fetching notices'); }
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
    error: (err) => { console.error('Error creating notice:', err); this.toast.error('Error creating notice'); }
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
      error: (err) => { console.error('Error updating notice:', err); this.toast.error('Error updating notice'); }
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
      error: (err) => { console.error('Error deleting notice:', err); this.toast.error('Error deleting notice'); }
    })
}
}

  
