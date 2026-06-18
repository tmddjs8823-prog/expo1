import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  // ── 로그인 (레이아웃 없음) ──
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },

  // ── 관리자 페이지 (레이아웃 포함) ──
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
      },
      {
        path: 'notice',
        loadComponent: () =>
          import('./pages/notice/notice.page').then(m => m.NoticePage),
      },
      {
        path: 'notice/:id',
        loadComponent: () =>
          import('./pages/notice/notice-detail.page').then(m => m.NoticeDetailPage),
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./pages/faq/faq.page').then(m => m.FaqPage),
      },
      {
        path: 'faq/:id',
        loadComponent: () =>
          import('./pages/faq/faq-detail.page').then(m => m.FaqDetailPage),
      },
      {
        path: 'exhibition',
        loadComponent: () =>
          import('./pages/exhibition/exhibition.page').then(m => m.ExhibitionPage),
      },
      {
        path: 'exhibition/:id',
        loadComponent: () =>
          import('./pages/exhibition/exhibition-detail.page').then(m => m.ExhibitionDetailPage),
      },
      {
        path: 'exhibitor',
        loadComponent: () =>
          import('./pages/exhibitor/exhibitor.page').then(m => m.ExhibitorPage),
      },
      {
        path: 'program',
        loadComponent: () =>
          import('./pages/program/program.page').then(m => m.ProgramPage),
      },
      {
        path: 'program/:id',
        loadComponent: () =>
          import('./pages/program/program-detail.page').then(m => m.ProgramDetailPage),
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./pages/gallery/gallery.page').then(m => m.GalleryPage),
      },
      {
        path: 'gallery/:id',
        loadComponent: () =>
          import('./pages/gallery/gallery-detail.page').then(m => m.GalleryDetailPage),
      },
      {
        path: 'inquiry',
        loadComponent: () =>
          import('./pages/inquiry/inquiry.page').then(m => m.InquiryPage),
      },
      {
        path: 'inquiry/:id',
        loadComponent: () =>
          import('./pages/inquiry/inquiry-detail.page').then(m => m.InquiryDetailPage),
      },
      {
        path: 'preregistration',
        loadComponent: () =>
          import('./pages/preregistration/preregistration.page').then(m => m.PreregistrationPage),
      },
      {
        path: 'preregistration/:id',
        loadComponent: () =>
          import('./pages/preregistration/preregistration-detail.page').then(m => m.PreregistrationDetailPage),
      },
      {
        path: 'banner',
        loadComponent: () =>
          import('./pages/banner/banner.page').then(m => m.BannerPage),
      },
      {
        path: 'exhibitor/:id',
        loadComponent: () =>
          import('./pages/exhibitor/exhibitor-detail.page').then(m => m.ExhibitorDetailPage),
      },
    ],
  },

  // ── 404 → 대시보드로 리다이렉트 ──
  { path: '**', redirectTo: '' },
];
