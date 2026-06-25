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
  imports : [FormsModule, AdminDataGridComponent, PageHeaderComponent],
  templateUrl: './faq.page.html',
})
export class FaqPage {
  private http = inject(HttpClient);
  router = inject(Router);

  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  


constructor() {
  this.loadFaqs();
  this.loadCategories();
}

// 시그널 초기상태 정의

faqs = signal<Faq[]>([]);
categories = signal<FaqCategory[]>([]); //카테고리 목록
question = signal('');
answer = signal('');
published = signal(true);
isEditing = signal(false);
selectedCategoryId = signal<number | null>(null);
selectedFaqId = signal<number | null>(null);
showNewCategory = signal(false);
newCategoryName = signal('');

// 검색 + 페이지네이션 (공통 유틸리티)
pg = useClientPagination({
  items: this.faqs,
  filterFn: (f, kw) =>
    f.question.toLowerCase().includes(kw) ||
    f.answer.toLowerCase().includes(kw) ||
    (f.category?.name ?? '').toLowerCase().includes(kw),
  filterDefs: [
    {
      key: 'published', label: '공개여부',
      options: [{ label: '공개', value: 'true' }, { label: '비공개', value: 'false' }],
      filterFn: (f, v) => String(f.published) === v,
    },
  ],
  manualSearch: true,
  pageSize: 3,
});

searchKeyword = this.pg.searchKeyword;

private readonly columnDefs: ColumnDef<Faq>[] = [
  { header: '카테고리', render: (f) => f.category?.name ?? '-', truncate: true, title: (f) => f.category?.name ?? '-' },
  { header: '질문', field: 'question', truncate: true, title: (f) => f.question },
  {
    header: '상태',
    type: 'badge',
    render: (f) => f.published ? '공개' : '비공개',
    badgeClass: (f) => f.published ? 'text-green-600' : 'text-red-500',
  },
  { header: '작성일', field: 'createdAt', type: 'date' },
  {
    header: '관리',
    actions: [
      { label: '삭제', class: 'text-red-600 hover:underline', onClick: (f) => this.deleteFaq(f.id) },
    ],
  },
];

readonly gridOption: DataGridOption<Faq> = {
  columnDefs: this.columnDefs,
  searchPlaceholder: '질문, 답변, 카테고리로 검색',
  emptyMessage: '등록된 FAQ가 없습니다.',
  rowClickable: true,
  pagination: this.pg,
};

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
    error: handleApiError(this.toast, '카테고리 조회 실패'),
  });
}

// 카테고리 생성
createCategory() {
  const name = this.newCategoryName().trim();
  if (!name) { this.toast.error('카테고리 이름을 입력해주세요.'); return; }
  this.http.post<FaqCategory>('/api/faq/category', { name }).subscribe({
    next: (created) => {
      this.loadCategories();
      this.selectedCategoryId.set(created.id);
      this.newCategoryName.set('');
      this.showNewCategory.set(false);
    },
    error: handleApiError(this.toast, '카테고리 생성 실패'),
  });
}

// 카테고리 삭제
async deleteCategory(id: number) {
  const ok = await this.confirmDialog.open({ title: '카테고리 삭제', message: '이 카테고리와 소속 FAQ가 모두 삭제됩니다.', variant: 'warning' }); if (!ok) return;
  this.http.delete(`/api/faq/category/${id}`).subscribe({
    next: () => {
      this.toast.warning('삭제되었습니다.');
      this.loadCategories();
      this.loadFaqs();
      if (this.selectedCategoryId() === id) this.selectedCategoryId.set(null);
    },
    error: (err) => {
      console.error('카테고리 삭제 실패:', err);
      this.toast.error('카테고리 삭제에 실패했습니다. 로그인 상태를 확인해주세요.');
    },
  });
}



// 로드
loadFaqs() {
  this.http.get<Faq[]>("/api/faq?all=true").subscribe({
    next: (response) => {
      this.faqs.set(response);
    },
    error: handleApiError(this.toast, 'FAQ 생성 실패')
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
      this.toast.success('FAQ이(가) 생성되었습니다.');
      this.loadFaqs();
      this.resetForm();
    },
    error: handleApiError(this.toast, 'FAQ 생성 실패')
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
      this.toast.success('FAQ이(가) 수정되었습니다.');
      this.loadFaqs();
      this.resetForm();
    },
    error: handleApiError(this.toast, 'FAQ 수정 실패')
  })
  }

  
  //삭제
  async deleteFaq(id:number) {
    const ok = await this.confirmDialog.open({ message: '이 항목을 삭제하면 되돌릴 수 없습니다.' }); if (!ok) return;
    this.http.delete(`/api/faq/${id}`)
    .subscribe({
      next: () => {
        this.toast.warning('삭제되었습니다.');
        this.loadFaqs();
        this.resetForm();
      },
      error: handleApiError(this.toast, 'FAQ 삭제 실패')
    });
  }
  
}
