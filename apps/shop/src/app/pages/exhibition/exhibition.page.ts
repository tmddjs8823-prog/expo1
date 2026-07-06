import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FadeUpDirective } from '../../shared/fade-up.directive';

interface Exhibition {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  imageUrl?: string;
  status: string;
}

interface CalendarDay {
  date: Date | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  exhibitions: Exhibition[];
}

// 전시회마다 고유 색상 — 12가지 선명한 팔레트 (캘린더 바 배경)
// exhibition.id % PALETTE.length 로 결정되어 항상 일관성 유지
const PALETTE: string[] = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-fuchsia-500',
];

function paletteOf(id: number) {
  return PALETTE[id % PALETTE.length];
}

const STATUS_LIGHT: Record<string, string> = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  DRAFT:     'bg-blue-50 text-blue-700 ring-blue-200',
  CLOSED:    'bg-slate-100 text-slate-500 ring-slate-200',
};


@Component({
  selector: 'app-exhibition',
  imports: [RouterModule, DatePipe, FadeUpDirective],
  templateUrl: './exhibition.page.html',
})
export class ExhibitionPage {
  Math = Math;
  private http = inject(HttpClient);

  exhibitions = signal<Exhibition[]>([]);
  viewMode = signal<'calendar' | 'list'>('calendar');
  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth());
  today = new Date();

  // 선택된 날짜 (클릭 시 하단에 행사 목록 표시)
  selectedDate = signal<Date | null>(null);

  // 상태 배지 클래스
  statusLight(status: string): string {
    return STATUS_LIGHT[status] ?? 'bg-slate-100 text-slate-500 ring-slate-200';
  }

  // 목록 뷰 정렬
  private statusOrder: Record<string, number> = { PUBLISHED: 0, DRAFT: 1, CLOSED: 2 };
  sortedExhibitions = computed(() =>
    [...this.exhibitions()].sort(
      (a, b) =>
        (this.statusOrder[a.status] ?? 9) - (this.statusOrder[b.status] ?? 9) ||
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  );

  // 캘린더 날짜 계산
  calendarWeeks = computed<CalendarDay[][]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    while (days.length % 7 !== 0) days.push(null);

    const weeks: CalendarDay[][] = [];
    for (let w = 0; w < days.length; w += 7) {
      weeks.push(days.slice(w, w + 7).map(date => this.buildCalendarDay(date)));
    }
    return weeks;
  });

  private buildCalendarDay(date: Date | null): CalendarDay {
    if (!date) return { date: null, isToday: false, isCurrentMonth: true, exhibitions: [] };

    const isToday = this.isSameDay(date, this.today);
    const cur = this.startOf(date);

    const exs = this.exhibitions().filter(ex => {
      const start = this.startOf(new Date(ex.startDate));
      const end = this.startOf(new Date(ex.endDate));
      return cur >= start && cur <= end;
    });

    return { date, isToday, isCurrentMonth: true, exhibitions: exs };
  }

  // 선택된 날짜의 행사 목록
  selectedExhibitions = computed(() => {
    const sel = this.selectedDate();
    if (!sel) return [];
    const cur = this.startOf(sel);
    return this.exhibitions().filter(ex => {
      const start = this.startOf(new Date(ex.startDate));
      const end = this.startOf(new Date(ex.endDate));
      return cur >= start && cur <= end;
    });
  });

  selectDate(date: Date | null) {
    if (!date) return;
    const sel = this.selectedDate();
    if (sel && this.isSameDay(sel, date)) {
      this.selectedDate.set(null);
    } else {
      this.selectedDate.set(date);
    }
  }

  isSelected(date: Date | null): boolean {
    const sel = this.selectedDate();
    if (!date || !sel) return false;
    return this.isSameDay(date, sel);
  }

  // 월 이동
  prevMonth() {
    let m = this.currentMonth() - 1;
    let y = this.currentYear();
    if (m < 0) { m = 11; y--; }
    this.currentMonth.set(m);
    this.currentYear.set(y);
    this.selectedDate.set(null);
  }

  nextMonth() {
    let m = this.currentMonth() + 1;
    let y = this.currentYear();
    if (m > 11) { m = 0; y++; }
    this.currentMonth.set(m);
    this.currentYear.set(y);
    this.selectedDate.set(null);
  }

  goToToday() {
    this.currentYear.set(this.today.getFullYear());
    this.currentMonth.set(this.today.getMonth());
    this.selectedDate.set(null);
  }

  // 헬퍼
  monthLabel = computed(() => {
    return new Date(this.currentYear(), this.currentMonth(), 1)
      .toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  });

  getStatusLabel(status: string) {
    return { PUBLISHED: '진행중', CLOSED: '종료', DRAFT: '예정' }[status] ?? '예정';
  }

  getExhibitionBadge() {
    return 'bg-primary-50 text-primary-700 ring-primary-200';
  }

  getExhibitionDot(id: number) {
    return paletteOf(id);
  }

  private isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  private startOf(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  constructor() {
    this.http.get<Exhibition[]>('/api/exhibition').subscribe({
      next: (res) => this.exhibitions.set(res),
      error: (err) => console.error('전시회 조회 실패:', err),
    });
  }

  readonly WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
}
