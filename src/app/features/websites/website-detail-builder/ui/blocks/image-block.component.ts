
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block } from '../../domain/models/block.model';

@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full bg-slate-100 overflow-hidden pointer-events-none">
        @if (src()) {
            <img [src]="src()" [alt]="alt()" class="w-full h-full object-cover">
        } @else {
            <div class="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span class="text-xs font-medium mt-2 text-center">Set an image URL in the properties panel.</span>
            </div>
        }
    </div>
  `
})
export class ImageBlockComponent {
  block = input.required<Block>();
  src = computed(() => this.block().content?.src);
  alt = computed(() => this.block().content?.alt || 'Image');
}
