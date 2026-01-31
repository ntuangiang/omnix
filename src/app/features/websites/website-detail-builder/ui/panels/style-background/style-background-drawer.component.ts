
import { Component, input, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../../../../core/services/state.service';
import { ClickOutsideDirective } from '../../../../../../core/directives/click-outside.directive';
import { BackgroundColorSwatchComponent } from './background-color-swatch.component';
import { StrokeStyleToggleComponent } from './stroke-style-toggle.component';
import { CornerRadiusControlComponent } from './corner-radius-control.component';
import { PaddingSegmentedControlComponent } from './padding-segmented-control.component';
import { PaddingSlidersComponent } from './padding-sliders.component';
import { BlendModeSelectComponent } from './blend-mode-select.component';
import { BackgroundColorPanelComponent } from './background-color-panel.component';
import { BlurSettingsComponent } from './blur-settings.component';
import { OverlayPositionService } from '../../../../../../core/services/overlay-position.service';

@Component({
  selector: 'app-style-background-drawer',
  standalone: true,
  imports: [
    CommonModule, 
    ClickOutsideDirective,
    BackgroundColorSwatchComponent,
    StrokeStyleToggleComponent,
    CornerRadiusControlComponent,
    PaddingSegmentedControlComponent,
    PaddingSlidersComponent,
    BlendModeSelectComponent,
    BackgroundColorPanelComponent,
    BlurSettingsComponent
  ],
  template: `
    @if (isOpen()) {
       <!-- The Main Drawer Wrapper -->
       <div class="fixed inset-0 z-[80] pointer-events-none font-sans">
           
           <!-- The Drawer UI -->
           <div #drawer
                class="absolute left-6 top-24 w-[320px] bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col animate-slide-right pointer-events-auto max-h-[calc(100vh-120px)]"
                (appClickOutside)="closeDrawer()"
                [ignore]="[panelContainer]">
                
                <header class="p-5 border-b border-slate-50 flex items-center justify-between shrink-0">
                   <h2 class="text-sm font-bold text-slate-900 tracking-tight">
                       {{ mode() === 'block' ? 'Block Style' : 'Section Background' }}
                   </h2>
                   <button (click)="close.emit()" class="text-slate-300 hover:text-slate-600 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                   </button>
                </header>

                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    <!-- Row 1: Background Toggle -->
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-700">Background Fill</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" [checked]="style().enabled" (change)="update('enabled', $any($event.target).checked)" class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div class="h-px bg-slate-50"></div>

                    <div class="space-y-6 animate-fade-in">
                        <!-- Row 2: Color (Only visible if enabled) -->
                        @if (style().enabled) {
                            <div class="flex items-center justify-between animate-fade-in">
                                <span class="text-xs font-semibold text-slate-700">Fill Color</span>
                                <div #swatchContainer>
                                    <app-background-color-swatch 
                                        [color]="style().color" 
                                        (click)="toggleColorPanel($event)">
                                    </app-background-color-swatch>
                                </div>
                            </div>
                            <div class="h-px bg-slate-50"></div>
                        }

                        <!-- Row 3: Stroke -->
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-slate-700">Stroke</span>
                            <app-stroke-style-toggle [value]="style().stroke" (change)="update('stroke', $event)"></app-stroke-style-toggle>
                        </div>

                        <!-- Row 4 & 5: Corner Radius & Padding (Visible if enabled) -->
                        @if (style().enabled) {
                            <div class="animate-fade-in space-y-6">
                                <!-- Row 4: Corner Radius -->
                                <div>
                                    <span class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Corner Radius</span>
                                    <div class="flex justify-end">
                                        <app-corner-radius-control [value]="style().cornerRadius" (change)="update('cornerRadius', $event)"></app-corner-radius-control>
                                    </div>
                                </div>

                                <!-- Row 5: Padding -->
                                <div>
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Padding</span>
                                        @if (style().paddingPreset && style().paddingPreset !== 'NONE') {
                                            <button (click)="update('paddingPreset', 'NONE')" 
                                                    class="text-[10px] font-bold text-slate-300 hover:text-slate-600 transition-colors uppercase tracking-wider">
                                                Clear
                                            </button>
                                        }
                                    </div>
                                    <app-padding-segmented-control [value]="style().paddingPreset" (change)="update('paddingPreset', $event)"></app-padding-segmented-control>
                                    
                                    @if (style().paddingPreset === 'CUSTOM') {
                                       <app-padding-sliders 
                                          [topBottom]="style().paddingTopBottomPct ?? 6"
                                          [leftRight]="style().paddingLeftRightPct ?? 6"
                                          (topBottomChange)="update('paddingTopBottomPct', $event)"
                                          (leftRightChange)="update('paddingLeftRightPct', $event)">
                                       </app-padding-sliders>
                                    }
                                </div>
                            </div>
                        }
                        
                        <div class="h-px bg-slate-50"></div>

                        <!-- Row 6: Blend Mode -->
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-slate-700">Blend Mode</span>
                            <div class="w-24">
                                <app-blend-mode-select [value]="style().blendMode" (change)="update('blendMode', $event)"></app-blend-mode-select>
                            </div>
                        </div>

                        <!-- Row 7: Blur -->
                        <app-blur-settings
                            [enabled]="style().blurEnabled"
                            [mode]="style().blurMode || 'backdrop'"
                            [amount]="style().blurAmountPx || 10"
                            (enabledChange)="update('blurEnabled', $event)"
                            (modeChange)="update('blurMode', $event)"
                            (amountChange)="update('blurAmountPx', $event)">
                        </app-blur-settings>

                    </div>
                </div>
           </div>

           <!-- Panel Container -->
           <div #panelContainer class="contents">
               @if (showColorPanel() && style().enabled) {
                   <div class="fixed z-[90] pointer-events-auto"
                        [style.top.px]="panelPosition().y"
                        [style.left.px]="panelPosition().x"
                        (appClickOutside)="showColorPanel.set(false)"
                        [ignore]="swatchContainer ? [swatchContainer] : []">
                       <app-background-color-panel 
                          [initialColor]="style().color"
                          (colorChange)="update('color', $event)">
                       </app-background-color-panel>
                   </div>
               }
           </div>
       </div>
    }
  `,
  styles: [`
    .animate-slide-right { animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class StyleBackgroundDrawerComponent {
  state = inject(StateService);
  overlayService = inject(OverlayPositionService);
  
  isOpen = input.required<boolean>();
  mode = input<'section' | 'block'>('section');
  close = output<void>();
  
  showColorPanel = signal(false);
  panelPosition = signal({ x: 0, y: 0 });

  style = computed(() => {
    return this.mode() === 'block' 
       ? this.state.editorStore.activeBlockBackgroundStyle() 
       : this.state.editorStore.activeSectionBackgroundStyle();
  });

  update(field: string, value: any) {
    const updates: any = { [field]: value };
    
    // Auto-enable if color is changed and it was disabled
    if (field === 'color' && !this.style().enabled) {
        updates.enabled = true;
    }

    if (this.mode() === 'block') {
        const blockId = this.state.selectedBlockId();
        if (blockId) {
            this.state.editorStore.updateBlockStyle(blockId, updates);
        }
    } else {
        const sectionId = this.state.selectedComponentId();
        if (sectionId) {
            this.state.editorStore.updateSectionBackgroundStyle(sectionId, updates);
        }
    }
    
    if (field === 'enabled' && !value) {
        this.showColorPanel.set(false);
    }
  }

  toggleColorPanel(event: MouseEvent) {
      event.stopPropagation();
      const target = event.currentTarget as HTMLElement;
      const targetRect = target.getBoundingClientRect();
      const drawerRightEdge = 24 + 320; 
      
      const virtualTarget = {
          getBoundingClientRect: () => ({
              top: targetRect.top,
              bottom: targetRect.bottom,
              left: drawerRightEdge,
              right: drawerRightEdge,
              width: 0,
              height: targetRect.height,
              x: drawerRightEdge,
              y: targetRect.top,
              toJSON: () => {}
          })
      };

      const pos = this.overlayService.calculatePosition(virtualTarget, 256, 300, 16); 
      this.panelPosition.set({ x: pos.left, y: pos.top });
      this.showColorPanel.update(v => !v);
  }

  closeDrawer() {
      this.close.emit();
  }
}
