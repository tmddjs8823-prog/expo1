import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

export interface FaqCategory {
  id :number;
  name : string;
  sortOrder: number;
  
}




export interface Faq {
  id: number;
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
  published: boolean;
  sortOrder: number;
  categoryId: number;
  category?: FaqCategory;
  createdAt: string;
  updatedAt: string;
}


@Component({
  selector: 'app-faq',
  imports : [FormsModule, DatePipe],
  templateUrl: './faq.page.html',
})
export class FaqPage {
  private http = inject(HttpClient);
  router = inject(Router);
  


constructor() {
  this.loadFaqs();
  this.loadCategories();
}

// 시그널 초기상태 정의

faqs = signal<Faq[]>([]);
searchKeyword = signal('');
filteredFaqs = computed(() => {
  const keyword = this.searchKeyword().toLowerCase();
  if (!keyword) return this.faqs();
  return this.faqs().filter(f =>
    f.question.toLowerCase().includes(keyword) ||
    f.answer.toLowerCase().includes(keyword) ||
    (f.category?.name ?? '').toLowerCase().includes(keyword)
  );
});
categories = signal<FaqCategory[]>([]); //카테고리 목록
question = signal('');
answer = signal('');
published = signal(true);
isEditing = signal(false);
selectedCategoryId = signal<number | null>(null);
selectedFaqId = signal<number | null>(null);
showNewCategory = signal(false);
newCategoryName = signal('');

// 리셋
resetForm() {
    this.question.set('');
    this.answer.set('');
    this.published.set(true);
    this.selectedCategoryId.set(null);
    this.selectedFaqId.set(null);
    this.isEditing.set(false);
  }

// 카테고리 로드
loadCategories() {
  this.http.get<FaqCategory[]>('/api/faq/category').subscribe({
    next: (res) => this.categories.set(res),
    error: (err) => console.error('카테고리 조회 실패:', err),
  });
}

// 카테고리 생성
createCategory() {
  const name = this.newCategoryName().trim();
  if (!name) { alert('카테고리 이름을 입력해주세요.'); return; }
  this.http.post<FaqCategory>('/api/faq/category', { name }).subscribe({
    next: (created) => {
      this.loadCategories();
      this.selectedCategoryId.set(created.id);
      this.newCategoryName.set('');
      this.showNewCategory.set(false);
    },
    error: (err) => console.error('카테고리 생성 실패:', err),
  });
}

// 카테고리 삭제
deleteCategory(id: number) {
  if (!confirm('이 카테고리와 소속 FAQ가 모두 삭제됩니다. 계속하시겠습니까?')) return;
  this.http.delete(`/api/faq/category/${id}`).subscribe({
    next: () => {
      this.loadCategories();
      this.loadFaqs();
      if (this.selectedCategoryId() === id) this.selectedCategoryId.set(null);
    },
    error: (err) => {
      console.error('카테고리 삭제 실패:', err);
      alert('카테고리 삭제에 실패했습니다. 로그인 상태를 확인해주세요.');
    },
  });
}



// 로드
loadFaqs() {
  this.http.get<Faq[]>("/api/faq").subscribe({
    next: (response) => {
      this.faqs.set(response);
    },
    error: (err) => {
      console.error('FAQ 생성 실패:', err);
    }
  });
}

//생성
createFaq() {
   this.http.post<Faq>("/api/faq", {
    question: this.question(),
    answer: this.answer(),
    categoryId: this.selectedCategoryId(),
    published: this.published(),
  }).subscribe({
    next: () => {
      this.loadFaqs();
      this.resetForm();
    },
    error: (err) => {
      console.error('FAQ 생성 실패:', err);
    }
  })
  }



//수정 모드 버튼 클릭시 편집모드 활성화 및 데이터 바인딩
editFaq(faq:Faq) {
  this.selectedFaqId.set(faq.id);
  this.question.set(faq.question);
  this.answer.set(faq.answer);
  this.published.set(faq.published);
  this.selectedCategoryId.set(faq.categoryId);
  this.isEditing.set(true);
}


//수정 버튼 클릭시 데이터 수정
updateFaq() {
   this.http.patch(`/api/faq/${this.selectedFaqId()}`, {
    question: this.question(),
    answer: this.answer(),
    categoryId: this.selectedCategoryId(),
    published: this.published(),
  }).subscribe({
    next: () => {
      this.loadFaqs();
      this.resetForm();
    },
    error: (err) => {
      console.error('FAQ 수정 실패:', err);
    }
  })
  }

  
  //삭제
  deleteFaq(id:number) {
    this.http.delete(`/api/faq/${id}`)
    .subscribe({
      next: () => {
        this.loadFaqs();
        this.resetForm();
      },
      error: (err) => {
        console.error('FAQ 삭제 실패:', err);
      }
    });
  }
  
}