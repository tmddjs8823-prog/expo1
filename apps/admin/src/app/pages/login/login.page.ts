import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private http = inject(HttpClient);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal('');

  login() {
    this.http
      .post<{ accessToken: string; refreshToken: string }>('/api/auth/login', {
        email: this.email(),
        password: this.password(),
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error.set('이메일 또는 비밀번호가 올바르지 않습니다.');
        },
      });
  }
}