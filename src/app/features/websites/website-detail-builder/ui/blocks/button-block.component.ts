
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block } from '../../domain/models/block.model';

@Component({
  selector: 'app-button-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex items-center justify-center pointer-events-none">
        <button [class]="buttonClasses()">
            {{ block().content?.label || 'Learn More' }}
        </button>
    </div>
  `
})
export class ButtonBlockComponent {
  block = input.required<Block>();

  buttonClasses = computed(() => {
    const style = this.block().content?.style || 'primary';
    const base = 'px-6 h-9 inline-flex items-center rounded-md text-xs font-bold uppercase tracking-widest transition-colors duration-200';
    if (style === 'secondary') {
        return `${base} bg-white text-slate-900 border border-slate-300 hover:bg-slate-100`;
    }
    return `${base} bg-slate-900 text-white hover:bg-slate-700`; // primary
  });
}
