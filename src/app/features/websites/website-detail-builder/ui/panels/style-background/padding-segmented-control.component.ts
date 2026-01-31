
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaddingPreset } from '../../../domain/models/section.model';

@Component({
  selector: 'app-padding-segmented-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex bg-slate-100 p-0.5 rounded-lg w-full">
      @for (opt of options; track opt) {
        <button (click)="change.emit(opt)"
                class="flex-1 h-6 rounded text-[10px] font-bold transition-all flex items-center justify-center"
                [class.bg-white]="value() === opt"
                [class.shadow-sm]="value() === opt"
                [class.text-slate-400]="value() !== opt"
                [class.text-slate-900]="value() === opt">
           @if (opt === 'CUSTOM') {
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
             </svg>
           } @else {
             {{ opt }}
           }
        </button>
      }
    </div>
  `
})
export class PaddingSegmentedControlComponent {
  value = input.required<PaddingPreset>();
  change = output<PaddingPreset>();
  options: PaddingPreset[] = ['S', 'M', 'L', 'CUSTOM'];
}
