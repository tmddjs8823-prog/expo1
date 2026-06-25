import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogConfig {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  /** true면 확인 버튼만 표시 (alert 모드) */
  alertOnly?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private _config = signal<ConfirmDialogConfig | null>(null);
  private _resolver: ((value: boolean) => void) | null = null;

  /** 현재 열린 다이얼로그 설정 (null = 닫힘) */
  readonly config = this._config.asReadonly();

  /**
   * 삭제 등 위험 작업 확인 다이얼로그를 띄운다.
   * @returns Promise<boolean> — 확인 시 true, 취소 시 false
   */
  open(config: ConfirmDialogConfig): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._resolver = resolve;
      this._config.set({
        title: config.title ?? '확인',
        confirmLabel: config.confirmLabel ?? '삭제',
        cancelLabel: config.cancelLabel ?? '취소',
        variant: config.variant ?? 'danger',
        ...config,
      });
    });
  }

  /** @internal — 컴포넌트에서만 호출 */
  _respond(result: boolean) {
    this._resolver?.(result);
    this._resolver = null;
    this._config.set(null);
  }

  /** 알림 다이얼로그 (확인 버튼만) */
  alert(config: Omit<ConfirmDialogConfig, 'alertOnly'>): Promise<boolean> {
    return this.open({
      ...config,
      confirmLabel: config.confirmLabel ?? '확인',
      alertOnly: true,
    });
  }
}
