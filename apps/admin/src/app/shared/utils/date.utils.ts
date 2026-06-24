// 날짜 + 시/분 → ISO 문자열 조합
export function assembleDateTime(date: string, hour: string, minute: string): string {
    if (!date) return '';
    return new Date(`${date}T${hour}:${minute}:00`).toISOString();
}

// Date → yyyy-MM-dd (로컬 시간 기준)
export function toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// 24시간 드롭다운 옵션 (00~23)
export const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

// 5분 단위 드롭다운 옵션 (00, 05, 10, ..., 55)
export const MINUTES_5 = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

// ISO 날짜 문자열을 시간 시그널용으로 분해
export function decomposeDatetime(iso: string): { date: string; hour: string; minute: string } {
    const d = new Date(iso);
    return {
        date: toLocalDateStr(d),
        hour: String(d.getHours()).padStart(2, '0'),
        minute: String(Math.round(d.getMinutes() / 5) * 5).padStart(2, '0'),
    };
}
