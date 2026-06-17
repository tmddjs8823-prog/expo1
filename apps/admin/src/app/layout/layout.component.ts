import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
    
})
export class LayoutComponent {
  private router = inject(Router);
  menuItems = [
    {label : '대시보드', path : '/dashboard'},
    {label : '공지사항', path : '/notice'},
    {label : 'FAQ', path : '/faq'},
    {label : '전시회', path: '/exhibition'},
    {label : '참가업체', path: '/exhibitor'},
    {label : '프로그램', path: '/program'},
    {label : '갤러리', path: '/gallery'},
    {label : '문의', path: 'inquiry'},
    {label : '사전등록', path:'/preregistration'}
  ];

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }
}
