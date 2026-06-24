// 필수 입력값 검증
export function validateRequired(value: string, fieldName: string): string | null {
  return value.trim() ? null : `${fieldName}을(를) 입력해주세요.`;
}

// 숫자 포함 여부 검증
export function validateNoNumbers(value: string, fieldName: string): string | null {
  return /\d/.test(value) ? `${fieldName}에 숫자를 입력할 수 없습니다.` : null;
}

// 이메일 형식 검증 (required=false이면 빈 값은 통과)
export function validateEmail(email: string, required = true): string | null {
  if (!required && !email.trim()) return null;
  if (!email.trim() || !email.includes('@')) return '올바른 이메일을 입력해주세요.';
  return null;
}

// 전화번호 형식 검증 (숫자와 하이픈만 허용)
export function validatePhone(phone: string): string | null {
  if (!phone.trim() || !/^[\d-]+$/.test(phone.trim())) return '올바른 전화번호를 입력해주세요.';
  return null;
}

// API 에러 응답을 사용자에게 보여줄 메시지로 파싱
export function parseApiError(err: { error?: { message?: string | string[] } }, fallback: string): string {
  const msg = err.error?.message;
  return Array.isArray(msg) ? msg.join('\n') : (msg || fallback);
}
