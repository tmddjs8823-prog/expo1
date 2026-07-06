import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-kakao-callback',
  imports: [RouterModule],
  templateUrl: './kakao-callback.page.html',
})
export class KakaoCallbackPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  error = signal('');

  async ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    const errorParam = this.route.snapshot.queryParamMap.get('error');

    if (errorParam) {
      this.error.set('카카오 인증이 취소되었습니다.');
      return;
    }

    if (!code) {
      this.error.set('인증 코드가 없습니다.');
      return;
    }

    try {
      await this.authService.kakaoLogin(code);
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const httpErr = err as { error?: { message?: string } };
      const msg = httpErr?.error?.message;
      this.error.set(msg || '카카오 로그인 중 오류가 발생했습니다.');
    }
  }
}
