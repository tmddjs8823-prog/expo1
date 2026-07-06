import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  async login() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.login(this.username(), this.password());
      if (!this.authService.isAdmin()) {
        this.error.set('관리자 권한이 없는 계정입니다.');
        await this.authService.logout();
        this.loading.set(false);
        return;
      }
      this.router.navigate(['/dashboard']);
    } catch {
      this.error.set('아이디 또는 비밀번호가 올바르지 않습니다.');
      this.loading.set(false);
    }
  }
}