
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { hexToRgba, Rgba, rgbaToCss } from '../../../../../../core/utils/color-utils';

@Component({
  selector: 'app-palette-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 pt-4">
       <!-- Swatches -->
       <div class="flex gap-2 justify-between">
          @for (hex of palette; track hex) {
             <button (click)="selectColor(hex)" 
                     class="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform shadow-sm"
                     [style.background-color]="hex">
             </button>
          }
       </div>
       
       <!-- Gradient Strip (Mock) -->
       <div class="h-3 w-full rounded-full border border-slate-100 relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDBoNHY0SDB6IiBmaWxsPSIjZjFmNXY5Ii8+PHBhdGggZD0iTTQgMGg0djRINFoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMCA0aDR2NEgwWiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik00IDRoNHY0SDRaIiBmaWxsPSIjZjFmNXY5Ii8+PC9zdmc+')]">
          <div class="absolute inset-0" style="background: linear-gradient(to right, rgba(255,255,255,0), rgba(0,0,0,1))"></div>
          <div class="absolute top-0 bottom-0 w-2 bg-white border border-slate-300 shadow rounded-full left-1/2 -translate-x-1 cursor-ew-resize"></div>
       </div>

       <!-- Edit Button -->
       <button class="w-full py-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          Edit Sitewide Palette
       </button>
    </div>
  `
})
export class PaletteTabComponent {
  select = output<Rgba>();
  
  palette = ['#ffffff', '#f8fafc', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#1e293b', '#0f172a'];

  selectColor(hex: string) {
     this.select.emit(hexToRgba(hex));
  }
}
