import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  title = input.required<string>();
  actionLabel = input<string>('');
  backLabel = input<string>('');
  actionClick = output<void>();
  backClick = output<void>();
}
