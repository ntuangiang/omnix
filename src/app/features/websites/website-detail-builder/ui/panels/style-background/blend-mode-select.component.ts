
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlendMode } from '../../../domain/models/section.model';

@Component({
  selector: 'app-blend-mode-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <select [ngModel]="value()" (ngModelChange)="change.emit($event)" 
            class="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer hover:text-blue-600 text-right w-full appearance-none">
       <option value="normal">Normal</option>
       <option value="multiply">Multiply</option>
       <option value="screen">Screen</option>
       <option value="overlay">Overlay</option>
       <option value="darken">Darken</option>
       <option value="lighten">Lighten</option>
    </select>
  `
})
export class BlendModeSelectComponent {
  value = input.required<BlendMode>();
  change = output<BlendMode>();
}
