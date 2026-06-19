import { Component, signal, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50">

      <!-- ① 상단 유틸리티 바 (모바일 숨김) -->
      <div class="hidden md:block bg-slate-800 text-slate-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end h-8 gap-4 text-xs">
          <a routerLink="/inquiry" class="hover:text-white transition-colors">문의하기</a>
          <span class="text-slate-600">|</span>
          <a routerLink="/auth/login" class="hover:text-white transition-colors">로그인</a>
        </div>
      </div>

      <!-- ② 로고 영역 + 모바일 햄버거 -->
      <div class="bg-white border-b border-slate-100"
           [class.shadow-sm]="scrolled()">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <a routerLink="/" class="flex items-center gap-2.5">
            <div class="leading-tight">
              <span class="block text-lg font-bold text-slate-900 tracking-tight">광주 밀리언쇼</span>
            </div>
          </a>

          <!-- 모바일 햄버거 버튼 -->
          <button (click)="mobileMenuOpen.set(!mobileMenuOpen())"
                  class="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="메뉴 토글">
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

      <!-- ③ GNB 메인 네비게이션 (데스크탑) -->
      <nav class="hidden md:block bg-slate-900">
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

            <!-- 고객센터 드롭다운 -->
            <li class="relative"
                (mouseenter)="csDropdownOpen.set(true)"
                (mouseleave)="csDropdownOpen.set(false)">
              <button type="button"
                      class="inline-flex items-center gap-1 h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      [class.bg-slate-800]="csDropdownOpen()"
                      [class.text-white]="csDropdownOpen()">
                고객센터
                <svg class="w-3.5 h-3.5 transition-transform" [class.rotate-180]="csDropdownOpen()"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (csDropdownOpen()) {
                <div class="absolute top-full left-0 w-44 bg-slate-800 rounded-b-lg shadow-lg overflow-hidden z-50">
                  <a routerLink="/notice"
                     class="block px-5 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                    공지사항
                  </a>
                  <a routerLink="/faq"
                     class="block px-5 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                    FAQ
                  </a>
                </div>
              }
            </li>

            <!-- 참가신청 드롭다운 -->
            <li class="relative"
                (mouseenter)="regDropdownOpen.set(true)"
                (mouseleave)="regDropdownOpen.set(false)">
              <button type="button"
                      class="inline-flex items-center gap-1 h-12 px-6 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      [class.bg-slate-800]="regDropdownOpen()"
                      [class.text-white]="regDropdownOpen()">
                참가신청
                <svg class="w-3.5 h-3.5 transition-transform" [class.rotate-180]="regDropdownOpen()"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (regDropdownOpen()) {
                <div class="absolute top-full left-0 w-44 bg-slate-800 rounded-b-lg shadow-lg overflow-hidden z-50">
                  <a routerLink="/preregistration"
                     class="block px-5 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                    사전등록
                  </a>
                  <a routerLink="/exhibitor"
                     class="block px-5 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                    참가업체 등록
                  </a>
                </div>
              }
            </li>
          </ul>
        </div>
      </nav>

      <!-- ④ 모바일 메뉴 (슬라이드 다운) -->
      @if (mobileMenuOpen()) {
        <nav class="md:hidden bg-slate-900 border-t border-slate-800 shadow-lg">
          <ul class="flex flex-col">
            <li>
              <a routerLink="/" (click)="mobileMenuOpen.set(false)"
                 routerLinkActive="bg-primary-600 text-white" [routerLinkActiveOptions]="{ exact: true }"
                 class="block px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                홈
              </a>
            </li>
            <li>
              <a routerLink="/exhibition" (click)="mobileMenuOpen.set(false)"
                 routerLinkActive="bg-primary-600 text-white"
                 class="block px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                전시안내
              </a>
            </li>
            <li>
              <a routerLink="/program" (click)="mobileMenuOpen.set(false)"
                 routerLinkActive="bg-primary-600 text-white"
                 class="block px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                프로그램
              </a>
            </li>
            <li>
              <a routerLink="/gallery" (click)="mobileMenuOpen.set(false)"
                 routerLinkActive="bg-primary-600 text-white"
                 class="block px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                갤러리
              </a>
            </li>

            <!-- 고객센터 그룹 -->
            <li class="border-t border-slate-800">
              <span class="block px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">고객센터</span>
            </li>
            <li>
              <a routerLink="/notice" (click)="mobileMenuOpen.set(false)"
                 class="block px-8 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                공지사항
              </a>
            </li>
            <li>
              <a routerLink="/faq" (click)="mobileMenuOpen.set(false)"
                 class="block px-8 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                FAQ
              </a>
            </li>

            <!-- 참가신청 그룹 -->
            <li class="border-t border-slate-800">
              <span class="block px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">참가신청</span>
            </li>
            <li>
              <a routerLink="/preregistration" (click)="mobileMenuOpen.set(false)"
                 class="block px-8 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                사전등록
              </a>
            </li>
            <li>
              <a routerLink="/exhibitor" (click)="mobileMenuOpen.set(false)"
                 class="block px-8 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                참가업체 등록
              </a>
            </li>

            <!-- 유틸리티 -->
            <li class="border-t border-slate-800">
              <a routerLink="/inquiry" (click)="mobileMenuOpen.set(false)"
                 class="block px-6 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                문의하기
              </a>
            </li>
            <li>
              <a routerLink="/auth/login" (click)="mobileMenuOpen.set(false)"
                 class="block px-6 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                로그인
              </a>
            </li>
          </ul>
        </nav>
      }
    </header>
  `,
})
export class HeaderComponent {
  scrolled = signal(false);
  mobileMenuOpen = signal(false);
  csDropdownOpen = signal(false);
  regDropdownOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }
}

