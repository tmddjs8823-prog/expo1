import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusColor' })
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-red-100 text-red-600';
      default: return 'bg-blue-100 text-blue-700';
    }
  }
}
