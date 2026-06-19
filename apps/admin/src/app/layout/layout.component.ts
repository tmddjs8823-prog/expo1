import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
    
})
export class LayoutComponent {
  private router = inject(Router);
  isMobileMenuOpen = signal(false);
  menuItems = [
    {label : '대시보드', path : '/dashboard'},
    {label : '공지사항', path : '/notice'},
    {label : 'FAQ', path : '/faq'},
    {label : '전시회', path: '/exhibition'},
    {label : '참가업체', path: '/exhibitor'},
    {label : '프로그램', path: '/program'},
    {label : '갤러리', path: '/gallery'},
    {label : '문의하기', path: 'inquiry'},
    {label : '사전등록', path:'/preregistration'},
    {label : '배너', path:'/banner'},
  ];

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }
}
