import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  // ── 홈 ──
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.page').then(m => m.HomePage),
  },

  // ── 전시안내 (목록) ──
  {
    path: 'exhibition',
    loadComponent: () =>
      import('./pages/exhibition/exhibition.page').then(m => m.ExhibitionPage),
  },

  // ── 전시회 상세 ──
  {
    path: 'exhibition/:id',
    loadComponent: () =>
      import('./pages/exhibition-detail/exhibition-detail.page').then(m => m.ExhibitionDetailPage),
  },

  // ── 프로그램 ──
  {
    path: 'program',
    loadComponent: () =>
      import('./pages/program/program.page').then(m => m.ProgramPage),
  },

  // ── 갤러리 ──
  {
    path: 'gallery',
    loadComponent: () =>
      import('./pages/gallery/gallery.page').then(m => m.GalleryPage),
  },

  // ── 문의하기 ──
  {
    path: 'inquiry',
    loadComponent: () =>
      import('./pages/inquiry/inquiry.page').then(m => m.InquiryPage),
  },

  // ── 공지사항 (목록) ──
  {
    path: 'notice',
    loadComponent: () =>
      import('./pages/notice/notice.page').then(m => m.NoticePage),
  },

  // ── 공지사항 상세 ──
  {
    path: 'notice/:id',
    loadComponent: () =>
      import('./pages/notice-detail/notice-detail.page').then(m => m.NoticeDetailPage),
  },

  // ── FAQ ──
  {
    path: 'faq',
    loadComponent: () =>
      import('./pages/faq/faq.page').then(m => m.FaqPage),
  },

  // ── 로그인 ──
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login.page').then(m => m.LoginPage),
  },

  // ── 사전등록 ──
  {
    path: 'preregistration',
    loadComponent: () =>
      import('./pages/preregistration/preregistration.page').then(m => m.PreregistrationPage),
  },

  // ── 참가업체 등록 ──
  {
    path: 'exhibitor',
    loadComponent: () =>
      import('./pages/exhibitor/exhibitor.page').then(m => m.ExhibitorPage),
  },

  // ── 404 → 홈으로 리다이렉트 ──
  { path: '**', redirectTo: '' },
];
