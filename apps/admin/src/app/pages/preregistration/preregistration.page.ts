import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';


export interface PreRegistration {
  id: number;     
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  createdAt: string;
  updatedAt: string;
  agreeTerms: boolean;
  agreeMarketing: boolean; 
}

@Component({
  selector: 'app-preregistration',
  imports: [FormsModule,DatePipe],
  templateUrl: './preregistration.page.html'
})
export class PreregistrationPage {
  private http = inject(HttpClient);

  //시그널 초기 상태 정의
  preRegistrations = signal<PreRegistration[]>([]);
  searchKeyword = signal('');
  filteredPreRegistrations = computed(() => {
    const keyword = this.searchKeyword().toLowerCase();
    if (!keyword) return this.preRegistrations();
    return this.preRegistrations().filter(r =>
      r.name.toLowerCase().includes(keyword) ||
      r.email.toLowerCase().includes(keyword) ||
      (r.company ?? '').toLowerCase().includes(keyword) ||
      (r.phone ?? '').toLowerCase().includes(keyword)
    );
  });
  selectedPreRegistrationId = signal<number | null>(null); // 현재 선택된 공지사항 ID
  
  //상태 목록 초기화
  constructor() {
    this.loadPreregistrations();
  }

  //전체 조회
  loadPreregistrations() {
    this.http.get<PreRegistration[]>("/api/preregistration").subscribe({
      next: (response) => {
        this.preRegistrations.set(response);
      },
      error: (err) => {
        console.error('사전등록 조회 실패:', err);
      }
    });
  }
  
  //선택 조회
  selectPreRegistration(id: number) {
    this.selectedPreRegistrationId.set(id);
  }
  //선택 삭제
  deletePreRegistration(id: number) {
    this.http.delete(`/api/preregistration/${id}`).subscribe({
      next: () => {
        this.loadPreregistrations();
      },
      error: (err) => {
        console.error('사전등록 삭제 실패:', err);
      }
    });
  }


}
