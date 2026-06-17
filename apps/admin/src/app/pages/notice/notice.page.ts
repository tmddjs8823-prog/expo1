import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

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
  imports: [FormsModule, DatePipe],
  templateUrl: './notice.page.html',
})
export class NoticePage{private http = 
  inject(HttpClient);
  router = inject(Router);

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
selectedNoticeId = signal<number | null>(null); // 현재 선택된 공지사항 ID
title = signal (''); // 폼 입력
content = signal(''); // 폼 입력
isEditing = signal(false); // 생성 수정 모드 구분





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
}

loadNotice(){
  this.http.get<Notice[]>('/api/notice')
    .subscribe({
      next: (res)=> {
        this.notices.set(res); 
      },
      error: (err)=> {
        console.error('Error fetching notices:', err);
      }
    });
}

// 생성모드

createNotice() {
  this.http.post('/api/notice',{
    title : this.title(),
    content : this.content()
  }).subscribe({
    next :()=>{ 
      this.loadNotice();
      this.resetForm();
    },
    error: (err) => {
      console.error('Error creating notice:', err);
    }
    })
}

//수정모드 버튼 누를시 데이터 바운딩
editNotice(notice : Notice) {

  this.selectedNoticeId.set(notice.id);
  this.title.set(notice.title);
  this.content.set(notice.content);
  this.isEditing.set(true);
}


//수정버튼 누른후 데이터 로드
updateNotice() {
  this.http.patch(`/api/notice/${this.selectedNoticeId()}`,{
    title : this.title(),
    content : this.content()
  })
    .subscribe({
      next: () => {
        this.loadNotice();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error updating notice:', err);
      }
    })
  }

deleteNotice(id : number) {
  this.http.delete(`/api/notice/${id}`)
    .subscribe({
      next: ()=> {
        this.loadNotice();
        this.resetForm();
      },
      error: (err)=> {
        console.error('Error deleting notice:', err);
      }
    })
}
}

  
