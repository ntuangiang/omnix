
import { Component, input, output, effect, signal, ViewChild, ElementRef, OnDestroy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rgba, Hsv, rgbToHsv, hsvToRgb, clamp } from '../../../../../../core/utils/color-utils';

@Component({
  selector: 'app-custom-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 pt-4 select-none">
       <!-- Saturation/Value Box -->
       <div #svBox 
            class="relative w-full h-40 rounded-lg shadow-inner overflow-hidden cursor-crosshair"
            [style.background-color]="hueColor()"
            (mousedown)="onSvStart($event)">
          <div class="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div class="absolute w-3 h-3 border-2 border-white shadow-sm rounded-full -translate-x-1.5 -translate-y-1.5 pointer-events-none"
               [style.left.%]="svPos().x"
               [style.top.%]="svPos().y"></div>
       </div>

       <!-- Hue Slider -->
       <div #hueSlider class="relative h-3 rounded-full cursor-pointer bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500"
            (mousedown)="onHueStart($event)">
           <div class="absolute top-0 bottom-0 w-3 bg-white border border-slate-200 shadow rounded-full -translate-x-1.5 pointer-events-none"
                [style.left.%]="(hsv().h / 360) * 100"></div>
       </div>

       <!-- Alpha Slider -->
       <div #alphaSlider class="relative h-3 rounded-full cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDBoNHY0SDB6IiBmaWxsPSIjZjFmNXY5Ii8+PHBhdGggZD0iTTQgMGg0djRINFoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMCA0aDR2NEgwWiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik00IDRoNHY0SDRaIiBmaWxsPSIjZjFmNXY5Ii8+PC9zdmc+')]"
            (mousedown)="onAlphaStart($event)">
           <div class="absolute inset-0 rounded-full" [style.background]="alphaGradient()"></div>
           <div class="absolute top-0 bottom-0 w-3 bg-white border border-slate-200 shadow rounded-full -translate-x-1.5 pointer-events-none"
                [style.left.%]="alpha() * 100"></div>
       </div>

       <!-- Numeric Inputs -->
       <div class="flex gap-2">
           <div class="relative flex-1">
               <select class="w-full bg-slate-50 border border-slate-200 rounded text-xs py-1 px-2 outline-none font-mono">
                   <option>RGB</option>
               </select>
           </div>
           <input type="number" [ngModel]="rgba().r" (ngModelChange)="updateRgb('r', $event)" class="w-10 bg-slate-50 border border-slate-200 rounded text-xs px-1 py-1 text-center font-mono">
           <input type="number" [ngModel]="rgba().g" (ngModelChange)="updateRgb('g', $event)" class="w-10 bg-slate-50 border border-slate-200 rounded text-xs px-1 py-1 text-center font-mono">
           <input type="number" [ngModel]="rgba().b" (ngModelChange)="updateRgb('b', $event)" class="w-10 bg-slate-50 border border-slate-200 rounded text-xs px-1 py-1 text-center font-mono">
           <div class="w-10 bg-slate-50 border border-slate-200 rounded text-xs px-1 py-1 text-center font-mono flex items-center justify-center">
               {{ Math.round(alpha() * 100) }}%
           </div>
       </div>
    </div>
  `
})
export class CustomColorPickerComponent implements OnDestroy {
  Math = Math;
  initialColor = input.required<Rgba>();
  colorChange = output<Rgba>();

  hsv = signal<Hsv>({ h: 0, s: 0, v: 1 });
  alpha = signal<number>(1);

  @ViewChild('svBox') svBox!: ElementRef<HTMLElement>;
  @ViewChild('hueSlider') hueSlider!: ElementRef<HTMLElement>;
  @ViewChild('alphaSlider') alphaSlider!: ElementRef<HTMLElement>;

  private rafId: number | null = null;
  public isDragging = false;
  private dragTarget: 'sv' | 'hue' | 'alpha' | null = null;

  constructor() {
      effect(() => {
          // Track initialColor dependency
          const init = this.initialColor();
          
          untracked(() => {
              if (this.isDragging) return;

              const current = this.rgba();
              
              const isSame = 
                  Math.abs(init.r - current.r) < 2 && 
                  Math.abs(init.g - current.g) < 2 && 
                  Math.abs(init.b - current.b) < 2 && 
                  Math.abs(init.a - current.a) < 0.05;

              if (!isSame) {
                  this.hsv.set(rgbToHsv(init.r, init.g, init.b));
                  this.alpha.set(init.a);
              }
          });
      });
  }

  ngOnDestroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.removeListeners();
  }

  hueColor() {
      const rgb = hsvToRgb(this.hsv().h, 1, 1);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  alphaGradient() {
      const rgb = hsvToRgb(this.hsv().h, this.hsv().s, this.hsv().v);
      return `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))`;
  }

  svPos() {
      return {
          x: this.hsv().s * 100,
          y: (1 - this.hsv().v) * 100
      };
  }

  rgba() {
      const rgb = hsvToRgb(this.hsv().h, this.hsv().s, this.hsv().v);
      return { ...rgb, a: this.alpha() };
  }

  emit(throttle = false) {
      if (throttle) {
          if (this.rafId) return;
          this.rafId = requestAnimationFrame(() => {
              this.colorChange.emit(this.rgba());
              this.rafId = null;
          });
      } else {
          this.colorChange.emit(this.rgba());
      }
  }

  updateRgb(channel: 'r' | 'g' | 'b', val: number) {
      const clamped = clamp(val, 0, 255);
      const current = this.rgba();
      const next = { ...current, [channel]: clamped };
      this.hsv.set(rgbToHsv(next.r, next.g, next.b));
      this.emit(false);
  }

  // --- Drag Handling ---

  onSvStart(e: MouseEvent) { this.startDrag(e, 'sv'); this.handleSvMove(e); }
  onHueStart(e: MouseEvent) { this.startDrag(e, 'hue'); this.handleHueMove(e); }
  onAlphaStart(e: MouseEvent) { this.startDrag(e, 'alpha'); this.handleAlphaMove(e); }

  startDrag(e: MouseEvent, target: 'sv' | 'hue' | 'alpha') {
      e.preventDefault();
      this.isDragging = true;
      this.dragTarget = target;
      document.addEventListener('mousemove', this.onDragMove);
      document.addEventListener('mouseup', this.onDragEnd);
  }

  onDragMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      if (this.dragTarget === 'sv') this.handleSvMove(e);
      if (this.dragTarget === 'hue') this.handleHueMove(e);
      if (this.dragTarget === 'alpha') this.handleAlphaMove(e);
  }

  onDragEnd = () => {
      this.isDragging = false;
      this.dragTarget = null;
      this.removeListeners();
      this.emit(false);
  }

  removeListeners() {
      document.removeEventListener('mousemove', this.onDragMove);
      document.removeEventListener('mouseup', this.onDragEnd);
  }

  handleSvMove(e: MouseEvent) {
      const rect = this.svBox.nativeElement.getBoundingClientRect();
      const x = clamp(e.clientX - rect.left, 0, rect.width);
      const y = clamp(e.clientY - rect.top, 0, rect.height);
      const s = x / rect.width;
      const v = 1 - (y / rect.height);
      this.hsv.update(curr => ({ ...curr, s, v }));
      this.emit(true);
  }

  handleHueMove(e: MouseEvent) {
      const rect = this.hueSlider.nativeElement.getBoundingClientRect();
      const x = clamp(e.clientX - rect.left, 0, rect.width);
      const h = (x / rect.width) * 360;
      this.hsv.update(curr => ({ ...curr, h }));
      this.emit(true);
  }

  handleAlphaMove(e: MouseEvent) {
      const rect = this.alphaSlider.nativeElement.getBoundingClientRect();
      const x = clamp(e.clientX - rect.left, 0, rect.width);
      this.alpha.set(x / rect.width);
      this.emit(true);
  }
}
