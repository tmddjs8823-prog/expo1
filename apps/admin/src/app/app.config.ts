import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient,withInterceptors} from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';
import { DatePipe } from '@angular/common';

// 앱 초기화 시 refresh token으로 Access Token 복원 시도
function initAuth(): () => Promise<void> {
  const authService = inject(AuthService);
  return () => authService.refresh().then(() => {});
}

export const appConfig: ApplicationConfig = {
  providers: [
  provideBrowserGlobalErrorListeners(),
  provideRouter(appRoutes),
  provideHttpClient(withInterceptors([authInterceptor])),
  DatePipe,
  {
    provide: APP_INITIALIZER,
    useFactory: initAuth,
    multi: true,
  },
  ]
};

