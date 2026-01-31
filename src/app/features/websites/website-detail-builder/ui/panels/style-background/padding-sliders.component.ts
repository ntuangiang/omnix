
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-padding-sliders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 pt-2 animate-fade-in">
      <!-- Top & Bottom Slider -->
      <div>
        <div class="flex justify-between items-center mb-2">
           <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top & Bottom</span>
           <span class="text-[10px] font-mono text-slate-700">{{ topBottom() }}%</span>
        </div>
        <div class="relative h-6 w-full flex items-center select-none touch-none cursor-pointer group"
             (mousedown)="startDrag($event, 'topBottom')">
           <!-- Track -->
           <div class="absolute inset-x-0 h-[2px] bg-slate-200 rounded-full"></div>
           <!-- Active Fill -->
           <div class="absolute left-0 h-[2px] bg-black rounded-full" [style.width.%]="(topBottom() / max) * 100"></div>
           <!-- Thumb -->
           <div class="absolute h-3 w-3 bg-black rounded-full shadow-sm top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform group-hover:scale-125"
                [style.left.%]="(topBottom() / max) * 100"></div>
        </div>
      </div>

      <div class="h-px bg-slate-50"></div>

      <!-- Left & Right Slider -->
      <div>
        <div class="flex justify-between items-center mb-2">
           <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Left & Right</span>
           <span class="text-[10px] font-mono text-slate-700">{{ leftRight() }}%</span>
        </div>
        <div class="relative h-6 w-full flex items-center select-none touch-none cursor-pointer group"
             (mousedown)="startDrag($event, 'leftRight')">
           <!-- Track -->
           <div class="absolute inset-x-0 h-[2px] bg-slate-200 rounded-full"></div>
           <!-- Active Fill -->
           <div class="absolute left-0 h-[2px] bg-black rounded-full" [style.width.%]="(leftRight() / max) * 100"></div>
           <!-- Thumb -->
           <div class="absolute h-3 w-3 bg-black rounded-full shadow-sm top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform group-hover:scale-125"
                [style.left.%]="(leftRight() / max) * 100"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PaddingSlidersComponent {
  topBottom = input.required<number>(); // Percentage 0-30
  leftRight = input.required<number>(); // Percentage 0-30
  
  topBottomChange = output<number>();
  leftRightChange = output<number>();

  max = 30; // Max percentage padding
  
  private isDragging = false;
  private activeSlider: 'topBottom' | 'leftRight' | null = null;
  private activeRect: DOMRect | null = null;

  startDrag(event: MouseEvent, slider: 'topBottom' | 'leftRight') {
      event.preventDefault();
      this.isDragging = true;
      this.activeSlider = slider;
      
      const target = event.currentTarget as HTMLElement;
      this.activeRect = target.getBoundingClientRect();
      
      this.updateValue(event.clientX);
      
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent) => {
      if (!this.isDragging) return;
      this.updateValue(event.clientX);
  }

  private onMouseUp = () => {
      this.isDragging = false;
      this.activeSlider = null;
      this.activeRect = null;
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
  }

  private updateValue(clientX: number) {
      if (!this.activeRect || !this.activeSlider) return;
      
      const rect = this.activeRect;
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      
      const pct = x / rect.width;
      const value = Math.round(pct * this.max);
      
      if (this.activeSlider === 'topBottom') {
          this.topBottomChange.emit(value);
      } else {
          this.leftRightChange.emit(value);
      }
  }
}
