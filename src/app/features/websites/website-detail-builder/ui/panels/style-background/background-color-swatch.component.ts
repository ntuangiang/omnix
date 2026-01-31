
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rgba, rgbaToCss } from '../../../../../../core/utils/color-utils';

@Component({
  selector: 'app-background-color-swatch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="click.emit($event)" 
            [disabled]="disabled()"
            class="w-6 h-6 rounded-full shadow-sm border border-slate-200 hover:scale-110 active:scale-95 transition-transform disabled:opacity-30 disabled:pointer-events-none"
            [style.background-color]="cssColor()">
    </button>
  `
})
export class BackgroundColorSwatchComponent {
  color = input.required<Rgba>();
  disabled = input<boolean>(false);
  click = output<MouseEvent>();

  get cssColor() {
    return () => rgbaToCss(this.color());
  }
}
