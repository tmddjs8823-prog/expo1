import { Component, input } from '@angular/core';

export interface DetailField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-detail-fields',
  template: `
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2"
         [class.md:grid-cols-3]="gridCols() === 3">
      @for (field of fields(); track field.label) {
        @if (field.value !== '') {
          <div class="flex flex-col gap-1">
            <span class="text-sm text-gray-500">{{ field.label }}</span>
            <p class="font-medium text-gray-900">{{ field.value }}</p>
          </div>
        }
      }
    </div>
  `,
})
export class AppDetailFieldsComponent {
  fields = input.required<DetailField[]>();
  gridCols = input<number>(2);
}
