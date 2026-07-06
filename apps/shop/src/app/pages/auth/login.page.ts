import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
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
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const httpErr = err as { error?: { message?: string } };
      const msg = httpErr?.error?.message;
      this.error.set(msg || '아이디 또는 비밀번호가 올바르지 않습니다.');
      this.loading.set(false);
    }
  }

  kakaoLogin() {
    window.location.href = this.authService.getKakaoAuthUrl();
  }
}
