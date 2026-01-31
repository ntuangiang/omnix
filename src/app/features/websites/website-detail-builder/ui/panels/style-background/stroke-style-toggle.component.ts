
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StrokeStyle } from '../../../domain/models/section.model';

@Component({
  selector: 'app-stroke-style-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex bg-slate-100 p-0.5 rounded-lg">
      <button (click)="change.emit('none')" 
              class="w-7 h-6 rounded flex items-center justify-center transition-all"
              [class.bg-white]="value() === 'none'"
              [class.shadow-sm]="value() === 'none'"
              [class.text-slate-400]="value() !== 'none'"
              [class.text-slate-900]="value() === 'none'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      
      <button (click)="change.emit('solid')" 
              class="w-7 h-6 rounded flex items-center justify-center transition-all"
              [class.bg-white]="value() === 'solid'"
              [class.shadow-sm]="value() === 'solid'"
              [class.text-slate-400]="value() !== 'solid'"
              [class.text-slate-900]="value() === 'solid'">
         <div class="w-3 h-3 border-2 border-current rounded-sm"></div>
      </button>

      <button (click)="change.emit('dashed')" 
              class="w-7 h-6 rounded flex items-center justify-center transition-all"
              [class.bg-white]="value() === 'dashed'"
              [class.shadow-sm]="value() === 'dashed'"
              [class.text-slate-400]="value() !== 'dashed'"
              [class.text-slate-900]="value() === 'dashed'">
         <div class="w-3 h-3 border-2 border-current border-dashed rounded-sm"></div>
      </button>
    </div>
  `
})
export class StrokeStyleToggleComponent {
  value = input.required<StrokeStyle>();
  change = output<StrokeStyle>();
}
