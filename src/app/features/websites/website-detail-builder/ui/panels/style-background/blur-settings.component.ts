
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlurMode } from '../../../domain/models/block.model';

@Component({
  selector: 'app-blur-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Blur Toggle Row -->
      <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-700">Blur</span>
          <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="enabled()" (change)="enabledChange.emit($any($event.target).checked)" class="sr-only peer">
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
      </div>

      @if (enabled()) {
        <div class="space-y-4 pt-2 animate-fade-in">
           <!-- Mode Segmented Control -->
           <div class="flex bg-slate-100 p-0.5 rounded-lg w-full">
               <button (click)="modeChange.emit('element')"
                       class="flex-1 h-6 rounded text-[10px] font-bold transition-all"
                       [class.bg-white]="mode() === 'element'"
                       [class.shadow-sm]="mode() === 'element'"
                       [class.text-slate-400]="mode() !== 'element'"
                       [class.text-slate-900]="mode() === 'element'">
                   Element
               </button>
               <button (click)="modeChange.emit('backdrop')"
                       class="flex-1 h-6 rounded text-[10px] font-bold transition-all"
                       [class.bg-white]="mode() === 'backdrop'"
                       [class.shadow-sm]="mode() === 'backdrop'"
                       [class.text-slate-400]="mode() !== 'backdrop'"
                       [class.text-slate-900]="mode() === 'backdrop'">
                   Backdrop
               </button>
           </div>
           
           <p class="text-[10px] text-slate-400 leading-tight px-1">
             Blurred backgrounds are more noticeable when the opacity is lower.
           </p>

           <!-- Amount Slider -->
           <div>
              <div class="flex justify-between items-center mb-2">
                 <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blur Amount</span>
                 <span class="text-[10px] font-mono text-slate-700">{{ amount() }}px</span>
              </div>
              <div class="relative h-6 w-full flex items-center select-none touch-none cursor-pointer group"
                   (mousedown)="startDrag($event)">
                 <!-- Track -->
                 <div class="absolute inset-x-0 h-[2px] bg-slate-200 rounded-full"></div>
                 <!-- Active Fill -->
                 <div class="absolute left-0 h-[2px] bg-black rounded-full" [style.width.%]="(amount() / max) * 100"></div>
                 <!-- Thumb -->
                 <div class="absolute h-3 w-3 bg-black rounded-full shadow-sm top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform group-hover:scale-125"
                      [style.left.%]="(amount() / max) * 100"></div>
              </div>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class BlurSettingsComponent {
  enabled = input.required<boolean>();
  mode = input.required<BlurMode>();
  amount = input.required<number>(); // px

  enabledChange = output<boolean>();
  modeChange = output<BlurMode>();
  amountChange = output<number>();

  max = 100;
  private isDragging = false;
  private activeRect: DOMRect | null = null;
  private rafId: number | null = null;

  startDrag(event: MouseEvent) {
      event.preventDefault();
      this.isDragging = true;
      const target = event.currentTarget as HTMLElement;
      this.activeRect = target.getBoundingClientRect();
      this.updateValue(event.clientX);
      
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent) => {
      if (!this.isDragging) return;
      
      if (this.rafId) return;
      this.rafId = requestAnimationFrame(() => {
          this.updateValue(event.clientX);
          this.rafId = null;
      });
  }

  private onMouseUp = () => {
      this.isDragging = false;
      this.activeRect = null;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
  }

  private updateValue(clientX: number) {
      if (!this.activeRect) return;
      let x = clientX - this.activeRect.left;
      x = Math.max(0, Math.min(x, this.activeRect.width));
      const pct = x / this.activeRect.width;
      const val = Math.round(pct * this.max);
      this.amountChange.emit(val);
  }
}
