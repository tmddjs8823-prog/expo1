import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.config(); as cfg) {
      <!-- 오버레이 -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div (click)="dialog._respond(false)"
             class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"></div>

        <!-- 모달 카드 -->
        <div class="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 flex flex-col items-center gap-4 animate-scale-in">
          <!-- 아이콘 -->
          <div class="w-12 h-12 rounded-full flex items-center justify-center"
               [class.bg-red-100]="cfg.variant === 'danger'"
               [class.bg-yellow-100]="cfg.variant === 'warning'"
               [class.bg-blue-100]="cfg.variant === 'info'">
            @switch (cfg.variant) {
              @case ('danger') {
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              }
              @case ('warning') {
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
              @default {
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              }
            }
          </div>

          <div class="text-center">
            <h3 class="text-lg font-semibold text-slate-900">{{ cfg.title }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ cfg.message }}</p>
          </div>

          <div class="flex gap-3 w-full mt-2">
            <button (click)="dialog._respond(false)"
              class="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
              {{ cfg.cancelLabel }}
            </button>
            <button (click)="dialog._respond(true)"
              class="flex-1 py-2.5 px-4 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              [class.bg-red-600]="cfg.variant === 'danger'"
              [class.hover:bg-red-700]="cfg.variant === 'danger'"
              [class.bg-yellow-600]="cfg.variant === 'warning'"
              [class.hover:bg-yellow-700]="cfg.variant === 'warning'"
              [class.bg-primary-600]="cfg.variant === 'info'"
              [class.hover:bg-primary-700]="cfg.variant === 'info'">
              {{ cfg.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fadeIn 0.15s ease-out; }
    .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  `],
})
export class ConfirmDialogComponent {
  dialog = inject(ConfirmDialogService);
}
