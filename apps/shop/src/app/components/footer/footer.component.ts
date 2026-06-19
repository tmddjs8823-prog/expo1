import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  template: `
    <footer class="bg-slate-900 text-slate-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 전시회 정보 -->
          <div>
            <h3 class="text-lg font-bold text-white mb-3">광주 밀리언쇼</h3>
            <p class="text-sm leading-relaxed">
              광주광역시에서 개최되는 전시박람회
            </p>
          </div>

          <!-- 빠른 링크 -->
          <div>
            <h4 class="text-sm font-semibold text-white mb-3">바로가기</h4>
            <ul class="space-y-2">
              <li><a routerLink="/exhibition" class="text-sm hover:text-white transition-colors">전시안내</a></li>
              <li><a routerLink="/program" class="text-sm hover:text-white transition-colors">프로그램</a></li>
              <li><a routerLink="/gallery" class="text-sm hover:text-white transition-colors">갤러리</a></li>
              <li><a routerLink="/support" class="text-sm hover:text-white transition-colors">고객지원</a></li>
            </ul>
          </div>

          <!-- 문의 -->
          <div>
            <h4 class="text-sm font-semibold text-white mb-3">문의</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a routerLink="/inquiry" class="hover:text-white transition-colors">온라인 문의하기</a>
              </li>
              <li>
                <a routerLink="/preregistration" class="hover:text-white transition-colors">사전등록</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- 하단 구분선 + 카피라이트 -->
        <div class="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; 2026 광주 밀리언쇼. All rights reserved.
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
