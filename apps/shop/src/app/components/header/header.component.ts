import { Component, signal, computed, HostListener, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

interface SearchResult {
  exhibitions: { id: number; title: string; description?: string; startDate?: string }[];
  notices: { id: number; title: string; createdAt?: string }[];
  faqs: { id: number; question: string }[];
  programs: { id: number; title: string; speaker?: string; startTime?: string }[];
  galleries: { id: number; title: string; imageUrl?: string }[];
}

@Component({
  selector: 'app-header',
  imports: [RouterModule, FormsModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  scrolled = signal(false);
  mobileMenuOpen = signal(false);
  megaMenuOpen = signal(false);

  // 인증 상태
  isLoggedIn = computed(() => this.authService.isAuthenticated());

  // ── 검색 ──
  searchOpen = signal(false);
  searchQuery = signal('');
  searchResults = signal<SearchResult | null>(null);
  searchLoading = signal(false);
  private searchSubject = new Subject<string>();

  // ── GNB 바로가기 ──
  private readonly shortcuts = [
    { label: '홈', path: '/', keywords: ['홈', '홈페이지', '메인', 'home', '첫', '첫페이지', '시작'] },
    { label: '전시안내', path: '/exhibition', keywords: ['전시', '전시안내', '전시회', 'exhibition', '행사', '이벤트', '안내'] },
    { label: '프로그램', path: '/program', keywords: ['프로그램', '일정', '세미나', 'program', '스케줄', '강연', '발표', '행사일정'] },
    { label: '시설안내', path: '/gallery', keywords: ['시설', '시설안내', '갤러리', '전시홀', '회의실', 'gallery', '시설 안내'] },
    { label: '공지사항', path: '/notice', keywords: ['공지', '공지사항', '안내', 'notice', '소식', '뉴스', '알림'] },
    { label: 'FAQ', path: '/faq', keywords: ['faq', '자주', '질문', '자주묻는', '도움말', '도움', '궁금'] },
    { label: '문의하기', path: '/inquiry', keywords: ['문의', '문의하기', 'inquiry', '연락', '상담', '질문하기', '고객센터', '고객'] },
    { label: '사전등록', path: '/preregistration', keywords: ['사전등록', '등록', '참가', 'registration', '참가신청', '신청', '접수', '사전', '관람객'] },
    { label: '참가업체 등록', path: '/exhibitor', keywords: ['참가업체', '업체', '부스', 'exhibitor', '참가신청', '신청', '업체등록', '출전', '출품', '참여'] },
    { label: '로그인', path: '/auth/login', keywords: ['로그인', '로그', 'login', '계정', '카카오', '소셜', '인증'] },
    { label: '회원가입', path: '/auth/register', keywords: ['회원가입', '가입', '회원', 'register', '계정만들기', '신규'] },
  ];

  matchedShortcuts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.shortcuts.filter(s =>
      s.keywords.some(k => k.toLowerCase().includes(q)) || s.label.toLowerCase().includes(q)
    );
  });

  totalResults = computed(() => {
    const r = this.searchResults();
    if (!r) return 0;
    return r.exhibitions.length + r.notices.length + r.faqs.length + r.programs.length + r.galleries.length;
  });

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searchLoading.set(true)),
      switchMap(q => this.http.get<SearchResult>(`/api/search?q=${encodeURIComponent(q)}`)),
    ).subscribe({
      next: (res) => {
        this.searchResults.set(res);
        this.searchLoading.set(false);
      },
      error: () => this.searchLoading.set(false),
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 50);
  }

  toggleSearch() {
    this.searchOpen.update(v => !v);
    if (this.searchOpen()) {
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>('#searchInput');
        el?.focus();
      });
    } else {
      this.searchQuery.set('');
      this.searchResults.set(null);
    }
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    if (value.trim().length >= 1) {
      this.searchSubject.next(value.trim());
    } else {
      this.searchResults.set(null);
    }
  }

  navigateTo(path: string) {
    this.searchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set(null);
    this.mobileMenuOpen.set(false);
    this.megaMenuOpen.set(false);
    this.router.navigateByUrl(path);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.searchOpen()) {
      this.searchOpen.set(false);
      this.searchQuery.set('');
      this.searchResults.set(null);
    }
  }

  async logout() {
    await this.authService.logout();
  }
}
