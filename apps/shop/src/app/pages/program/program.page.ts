import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FadeUpDirective } from '../../shared/fade-up.directive';

interface Program {
  id: number;
  title: string;
  description?: string;
  speaker?: string;
  startTime: string;
  endTime: string;
  exhibition?: { id: number; title: string; venue?: string };
}

@Component({
  selector: 'app-program',
  imports: [DatePipe, FadeUpDirective],
  templateUrl: './program.page.html'
})
export class ProgramPage {
  private http = inject(HttpClient);
  programs = signal<Program[]>([]);
  selectedDate = signal<string | null>(null);

  // 날짜별 그룹핑
  groupedByDate = computed(() => {
    const groups = new Map<string, Program[]>();
    for (const p of this.programs()) {
      const dateKey = new Date(p.startTime).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
      });
      const existing = groups.get(dateKey) ?? [];
      existing.push(p);
      groups.set(dateKey, existing);
    }
    // 시간순 정렬
    for (const [, list] of groups) {
      list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    return Array.from(groups.entries());
  });

  constructor() {
    this.http.get<Program[]>('/api/program').subscribe({
      next: (res) => this.programs.set(res),
      error: (err) => console.error('프로그램 조회 실패:', err),
    });
  }
}
