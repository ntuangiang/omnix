
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-corner-radius-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center gap-2">
      <div class="flex text-slate-400">
         <button class="p-1 hover:text-slate-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12a10 10 0 1 0 20 0"/></svg></button>
         <button class="p-1 hover:text-slate-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></button>
      </div>
      <input type="number" [ngModel]="value()" (ngModelChange)="change.emit($event)" class="w-16 bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 text-right outline-none focus:border-blue-500">
    </div>
  `
})
export class CornerRadiusControlComponent {
  value = input.required<number>();
  change = output<number>();
}
