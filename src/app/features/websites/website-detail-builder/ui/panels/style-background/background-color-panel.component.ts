
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteTabComponent } from './palette-tab.component';
import { CustomColorPickerComponent } from './custom-color-picker.component';
import { Rgba } from '../../../../../../core/utils/color-utils';

@Component({
  selector: 'app-background-color-panel',
  standalone: true,
  imports: [CommonModule, PaletteTabComponent, CustomColorPickerComponent],
  template: `
    <div class="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 p-4 w-64 animate-fade-in"
         (click)="$event.stopPropagation()">
         
         <div class="flex border-b border-slate-100">
             <button (click)="activeTab.set('palette')" 
                     class="flex-1 pb-2 text-xs font-bold uppercase tracking-wide transition-colors"
                     [class.text-slate-900]="activeTab() === 'palette'"
                     [class.border-b-2]="activeTab() === 'palette'"
                     [class.border-slate-900]="activeTab() === 'palette'"
                     [class.text-slate-400]="activeTab() !== 'palette'"
                     [class.border-transparent]="activeTab() !== 'palette'">
                 Palette
             </button>
             <button (click)="activeTab.set('custom')" 
                     class="flex-1 pb-2 text-xs font-bold uppercase tracking-wide transition-colors"
                     [class.text-slate-900]="activeTab() === 'custom'"
                     [class.border-b-2]="activeTab() === 'custom'"
                     [class.border-slate-900]="activeTab() === 'custom'"
                     [class.text-slate-400]="activeTab() !== 'custom'"
                     [class.border-transparent]="activeTab() !== 'custom'">
                 Custom
             </button>
         </div>

         @if (activeTab() === 'palette') {
             <app-palette-tab (select)="colorChange.emit($event)"></app-palette-tab>
         } @else {
             <app-custom-color-picker [initialColor]="initialColor()" (colorChange)="colorChange.emit($event)"></app-custom-color-picker>
         }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.15s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class BackgroundColorPanelComponent {
  initialColor = input.required<Rgba>();
  colorChange = output<Rgba>();
  activeTab = signal<'palette' | 'custom'>('custom');
}
