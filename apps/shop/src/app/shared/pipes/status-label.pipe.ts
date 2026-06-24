import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'PUBLISHED': return '진행중';
      case 'CLOSED': return '종료';
      default: return '예정';
    }
  }
}
