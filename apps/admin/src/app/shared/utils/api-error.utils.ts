import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';

/**
 * API 에러 응답에서 사용자 친화적 메시지를 추출하여 toast로 표시합니다.
 * NestJS ValidationPipe의 message 배열 또는 단일 문자열을 처리합니다.
 */
export function handleApiError(toast: ToastService, fallback: string) {
  return (err: HttpErrorResponse) => {
    console.error(fallback, err);
    const msg = err.error?.message;
    if (Array.isArray(msg)) {
      toast.error(msg.join('\n'));
    } else {
      toast.error(msg || fallback);
    }
  };
}

/**
 * 삭제 실패 시 다이얼로그로 에러 메시지를 표시합니다.
 */
export function handleDeleteError(confirmDialog: ConfirmDialogService, fallback: string) {
  return (err: HttpErrorResponse) => {
    console.error(fallback, err);
    const msg = err.error?.message;
    const text = Array.isArray(msg) ? msg.join('\n') : (msg || fallback);
    confirmDialog.alert({
      title: '삭제 불가',
      message: text,
      variant: 'warning',
      confirmLabel: '확인',
    });
  };
}

