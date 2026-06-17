import { Component, signal, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50">

      <!-- ① 상단 유틸리티 바 -->
      <div class="bg-slate-800 text-slate-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end h-8 gap-4 text-xs">
          <a routerLink="/inquiry" class="hover:text-white transition-colors">문의하기</a>
          <span class="text-slate-600">|</span>
          <a routerLink="/auth/login" class="hover:text-white transition-colors">로그인</a>
        </div>
      </div>

      <!-- ② 로고 영역 -->
      <div class="bg-white border-b border-slate-100"
           [class.shadow-sm]="scrolled()">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <a routerLink="/" class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <div class="leading-tight">
              <span class="block text-lg font-bold text-slate-900 tracking-tight">광주 밀리언쇼</span>
            </div>
          </a>

          <!-- 모바일 햄버거 -->
          <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (mobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- ③ GNB 메인 네비게이션 -->
      <nav class="hidden lg:block bg-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul class="flex items-center h-12 gap-0">
            <li>
              <a routerLink="/" routerLinkActive="bg-primary-600 text-white" [routerLinkActiveOptions]="{ exact: true }"
                 class="inline-flex items-center h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                홈
              </a>
            </li>
            <li>
              <a routerLink="/exhibition" routerLinkActive="bg-primary-600 text-white"
                 class="inline-flex items-center h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                전시안내
              </a>
            </li>
            <li>
              <a routerLink="/program" routerLinkActive="bg-primary-600 text-white"
                 class="inline-flex items-center h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                프로그램
              </a>
            </li>
            <li>
              <a routerLink="/gallery" routerLinkActive="bg-primary-600 text-white"
                 class="inline-flex items-center h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                갤러리
              </a>
            </li>
            <li>
              <a routerLink="/support" routerLinkActive="bg-primary-600 text-white"
                 class="inline-flex items-center h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                고객지원
              </a>
            </li>
            <li>
              <a routerLink="/preregistration" routerLinkActive="bg-primary-600 text-white"
                 class="inline-flex items-center h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                사전등록
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- 모바일 드롭다운 메뉴 -->
      @if (mobileMenuOpen()) {
        <div class="lg:hidden bg-white border-b border-slate-200 shadow-lg">
          <nav class="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <a routerLink="/" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-primary-50 text-primary-700" [routerLinkActiveOptions]="{ exact: true }"
               class="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">홈</a>
            <a routerLink="/exhibition" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-primary-50 text-primary-700"
               class="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">전시안내</a>
            <a routerLink="/program" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-primary-50 text-primary-700"
               class="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">프로그램</a>
            <a routerLink="/gallery" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-primary-50 text-primary-700"
               class="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">갤러리</a>
            <a routerLink="/support" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-primary-50 text-primary-700"
               class="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">고객지원</a>
            <a routerLink="/preregistration" (click)="mobileMenuOpen.set(false)" routerLinkActive="bg-primary-50 text-primary-700"
               class="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">사전등록</a>
            <div class="pt-2 border-t border-slate-100">
              <a routerLink="/auth/login" (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2.5 text-sm font-medium text-center text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">로그인</a>
            </div>
          </nav>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  scrolled = signal(false);
  mobileMenuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }
}
