
import { Component, input, output, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../../../core/services/state.service';
import { EditorStore } from '../../data/website-detail-builder.store';
import { UiComponent, SectionSettings } from '../../domain/models/section.model';
import { ColorThemeType, DEFAULT_GRID } from '../../domain/models/builder-document.model';
import { GridSnapService } from '../../dnd/grid-snap.service';
import { BlockHostComponent } from './block-host.component';
import { GridOverlayComponent } from './grid-overlay.component';
import { Block } from '../../domain/models/block.model';
import { LayersPanelComponent } from '../panels/layers-panel.component';
import { ClickOutsideDirective } from '../../../../../core/directives/click-outside.directive';
import { rgbaToCss } from '../../../../../core/utils/color-utils';

const LAYER_DRAG_TYPE = 'application/x-nexus-layer-drag';

@Component({
  selector: 'app-section-canvas',
  standalone: true,
  imports: [CommonModule, BlockHostComponent, GridOverlayComponent, LayersPanelComponent, ClickOutsideDirective],
  template: `
    <div 
        class="relative w-full transition-all duration-300"
        [class.z-20]="isSelected() || isActiveDrop()"
        (click)="onSectionClick($event)"
        (dragenter)="onDragEnter($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
    >
    
    <!-- Contextual Add Borders -->
    <div class="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 pointer-events-none transition-opacity duration-200 z-50"
         [class.opacity-100]="showTopBorder()"
         [class.opacity-0]="!showTopBorder()">
    </div>
     <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 pointer-events-none transition-opacity duration-200 z-50"
         [class.opacity-100]="showBottomBorder()"
         [class.opacity-0]="!showBottomBorder()">
    </div>

    <!-- Selection/Hover/Resize Border -->
    <div class="absolute -inset-px rounded-lg border-2 pointer-events-none transition-opacity opacity-0 z-40"
        [class.opacity-100]="isSelected() || isShowingResizeUI() || isHovered()"
        [class.border-blue-500]="isSelected() || isShowingResizeUI()"
        [class.border-blue-300]="!isSelected() && !isShowingResizeUI() && isHovered()">
    </div>

    <section 
        class="relative w-full rounded-lg overflow-hidden isolate"
        [style.min-height]="minHeightStyle()"
    >
        <!-- Layer 0: Base Background (Image or Fallback Color) + Element Blur -->
        <!-- 
           If blurMode is 'element', we apply the blur filter directly to this layer.
           This blurs the image/solid color itself.
        -->
        <div class="absolute inset-0 z-0 bg-cover bg-center transition-all duration-300"
             [ngClass]="baseThemeClasses()"
             [style.background-image]="backgroundImageStyle()"
             [style.filter]="elementBlurFilter()">
        </div>

        <!-- Layer 1: Color Overlay + Backdrop Blur -->
        <!-- 
           If blurMode is 'backdrop', we apply backdrop-filter to this overlay div.
           It sits ABOVE Layer 0 but BELOW Layer 2 (Content).
           The background-color here provides the tint/opacity.
        -->
        <div class="absolute inset-0 z-[1] transition-all duration-300"
             [style.background-color]="overlayColorStyle()"
             [style.backdrop-filter]="backdropBlurFilter()"
             [style.-webkit-backdrop-filter]="backdropBlurFilter()">
        </div>

        <!-- Layer 2: Content (Grid & Blocks) -->
        <div class="relative z-[2] w-full h-full">
            <app-grid-overlay 
                [config]="grid" 
                [isVisible]="isActiveDrop() || isBlockResizing() || isShowingResizeUI()" 
                [sectionId]="component().id">
            </app-grid-overlay>

            @if (isShowingResizeUI()) {
                <!-- Center Guideline -->
                <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-blue-500/50 pointer-events-none"
                    style="background-image: linear-gradient(to bottom, rgb(59 130 246 / 0.8) 50%, transparent 50%); background-size: 1px 8px;">
                </div>
            }

            @if (isActiveDrop() && dropIndicator(); as pos) {
                <div class="absolute z-50 pointer-events-none border-2 border-blue-500 bg-blue-500/10 transition-all duration-100 ease-out"
                        [style.left.px]="getPx(pos.x, 'x')"
                        [style.top.px]="getPx(pos.y, 'y')"
                        [style.width.px]="getPx(pos.w, 'w')"
                        [style.height.px]="getPx(pos.h, 'h')">
                        <div class="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-wider">
                            {{ pos.type }}
                        </div>
                </div>
            }

            @for (block of component().blocks; track block.id) {
                <app-block-host
                    [block]="block"
                    [sectionId]="component().id"
                    [isSelected]="selectedBlockId() === block.id"
                    [isEditing]="editingBlockId() === block.id"
                    [gridConfig]="grid"
                    (select)="onBlockSelect(block.id, $event)"
                    (edit)="onBlockEdit(block.id, $event)"
                    (stopEdit)="onStopEdit()"
                    (remove)="onBlockRemove(block.id)"
                    (blockUpdate)="onBlockUpdate(block.id, $event)"
                    (resizeStart)="isBlockResizing.set(true)"
                    (resizeEnd)="onBlockResizeEnd()"
                    (contextmenu)="onBlockContextMenu($event, block.id)"
                    (showProperties)="blockShowProperties.emit(block.id)"
                    (openStyleBackground)="openStyleBackground.emit()"
                ></app-block-host>
            }
            
            @if (!component().blocks?.length) {
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <span class="font-serif italic text-2xl">Drag blocks here</span>
                </div>
            }
        </div>
    </section>

    <!-- Right-side controls -->
    <div class="absolute right-4 top-4 z-40 transition-opacity duration-200 flex flex-col gap-1 pointer-events-auto"
         [class.opacity-100]="isHovered()"
         [class.opacity-0]="!isHovered()">
        <!-- Section Menu -->
        <div class="bg-white rounded-lg shadow-lg border border-slate-100 flex flex-col w-40">
            <div class="p-1 space-y-1">
                <button (click)="editSection.emit()" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-md">Edit Section</button>
                <button (click)="viewLayouts.emit()" class="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-md">View Layouts</button>
            </div>
            <div class="h-px bg-slate-100 mx-2"></div>
            <div class="flex items-center justify-around p-1">
                <button (click)="onDuplicateSection()" class="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full" title="Duplicate Section">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full" title="Favorite">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                 <div class="flex items-center">
                    <button (click)="onMoveSection('up')" class="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full" title="Move Up">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <button (click)="onMoveSection('down')" class="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full" title="Move Down">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                </div>
            </div>
             <div class="h-px bg-slate-100 mx-2"></div>
            <div class="p-1">
                <button (click)="removeSection.emit()" class="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md">Remove</button>
            </div>
        </div>
    </div>
    
    <!-- Resize Mode Toggle Button -->
    <button (mousedown)="onRowResizeStart($event)"
            (click)="toggleResizeMode($event)"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-8 h-8 flex items-center justify-center rounded-md shadow-lg transition-all duration-200 opacity-0 pointer-events-auto"
            [class.opacity-100]="isHovered()"
            [class.bg-blue-600]="!isShowingResizeUI()"
            [class.text-white]="!isShowingResizeUI()"
            [class.hover:bg-blue-700]="!isShowingResizeUI()"
            [class.bg-white]="isShowingResizeUI()"
            [class.text-blue-600]="isShowingResizeUI()"
            [class.hover:bg-slate-50]="isShowingResizeUI()"
            [class.cursor-ns-resize]="isRowResizing()"
            title="Toggle Resize Mode">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
    </button>


    <div class="absolute left-6 top-6 z-[60] opacity-0 transition-opacity flex items-center gap-2"
         [class.opacity-100]="isHovered()">
      <!-- Panel Wrapper with ClickOutside -->
      <div class="relative" (appClickOutside)="showLayersPanel.set(false)">
          <!-- Layers Button -->
          <button (click)="toggleLayersPanel($event)" class="bg-white text-slate-600 w-9 h-9 flex items-center justify-center rounded-full shadow-lg hover:bg-slate-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </button>
          <!-- Layers Panel -->
          <app-layers-panel
              [isOpen]="showLayersPanel()"
              [blocks]="component().blocks || []"
              [selectedBlockId]="selectedBlockId()"
              (selectBlock)="onLayerSelect($event)"
              (reorderBlocks)="blockReorder.emit($event)"
              (close)="showLayersPanel.set(false)">
          </app-layers-panel>
      </div>
      
      <!-- Add Block Button -->
      <button (click)="addBlockClick.emit($event)" class="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-500 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M12 5v14M5 12h14"/></svg>
         Block
      </button>
    </div>
  </div>
  `
})
export class SectionCanvasComponent {
  component = input.required<UiComponent>();
  isSelected = input.required<boolean>();
  selectedBlockId = input<string | null>(null);
  editingBlockId = input<string | null>(null);
  showTopBorder = input(false);
  showBottomBorder = input(false);

  select = output<void>();
  editSection = output<void>();
  removeSection = output<void>();
  duplicateSection = output<string>();
  moveSection = output<{ sectionId: string; direction: 'up' | 'down' }>();
  addBlockClick = output<MouseEvent>();
  viewLayouts = output<void>();
  
  blockSelect = output<string>();
  blockEdit = output<string>();
  blockStopEdit = output<void>();
  blockRemove = output<{sectionId: string, blockId: string}>();
  blockUpdate = output<{sectionId: string, blockId: string, updates: Partial<Block>}>();
  blockReorder = output<Block[]>();
  blockResizeEnd = output<void>();
  rowResizeEnd = output<void>();
  blockShowProperties = output<string>();
  blockContextMenu = output<{ event: MouseEvent, blockId: string }>();
  openStyleBackground = output<void>();

  state = inject(StateService);
  gridSnapService = inject(GridSnapService);
  editorStore = inject(EditorStore);

  isHovered = signal(false);
  isActiveDrop = signal(false);
  dropIndicator = signal<{ x: number, y: number, w: number, h: number, type: string } | null>(null);
  
  isBlockResizing = signal(false);
  isRowResizing = signal(false);
  resizeStartY = 0;
  initialRowCount = 0;
  isShowingResizeUI = signal(false);
  
  showLayersPanel = signal(false);

  // Computeds
  activeStyle = computed(() => this.component().settings?.backgroundStyle || this.state.getDefaultSettings().backgroundStyle);

  backgroundImageStyle = computed(() => {
    const bg = this.component().settings?.background;
    if (bg?.type === 'image' && bg.imageSrc) {
        return `url(${bg.imageSrc})`;
    }
    return 'none';
  });

  baseThemeClasses = computed(() => {
     // If we rely on themes for the base layer, map them here.
     // For now, assume theme colors apply if no specific background style override is active for the base layer?
     // Actually, the previous implementation applied theme classes to the section. 
     // We should apply them to the base layer div.
     const theme = this.component().settings?.colorTheme;
     const t = theme || 'LIGHTEST_1';
     switch(t) {
        case 'LIGHTEST_1': return 'bg-white';
        case 'LIGHTEST_2': return 'bg-slate-50';
        case 'LIGHT_1': return 'bg-slate-100';
        case 'LIGHT_2': return 'bg-slate-200';
        case 'BRIGHT_1': return 'bg-blue-50';
        case 'BRIGHT_2': return 'bg-green-50';
        case 'DARK_1': return 'bg-slate-800';
        case 'DARK_2': return 'bg-slate-900';
        case 'DARKEST_1': return 'bg-neutral-900';
        case 'DARKEST_2': return 'bg-black';
        default: return 'bg-white';
    }
  });

  overlayColorStyle = computed(() => {
     const s = this.activeStyle();
     if (s.enabled && s.color) {
         return rgbaToCss(s.color);
     }
     // Default transparent so underlying image/color shows
     return 'transparent';
  });

  elementBlurFilter = computed(() => {
      const s = this.activeStyle();
      if (s.blurEnabled && s.blurMode === 'element') {
          return `blur(${s.blurAmountPx}px)`;
      }
      return 'none';
  });

  backdropBlurFilter = computed(() => {
      const s = this.activeStyle();
      if (s.blurEnabled && s.blurMode === 'backdrop') {
          return `blur(${s.blurAmountPx}px)`;
      }
      return 'none';
  });

  minHeightStyle = computed(() => {
      const rowCount = this.component().settings?.design.grid.rowCount ?? 16;
      const height = this.gridSnapService.getMinHeightPx(rowCount, DEFAULT_GRID);
      return `${height}px`;
  });

  get grid() {
      return DEFAULT_GRID;
  }

  getPx(units: number, dim: 'x' | 'y' | 'w' | 'h') {
      return this.gridSnapService.getPx(units, dim, this.grid);
  }

  // --- Event Handlers ---

  @HostListener('mouseenter')
  onMouseEnter() {
      if (!this.state.isDragging()) {
        this.isHovered.set(true);
      }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
      this.isHovered.set(false);
  }

  onSectionClick(event: MouseEvent) {
      if (this.isRowResizing()) return;
      this.select.emit();
  }

  onDuplicateSection() {
    this.duplicateSection.emit(this.component().id);
  }

  onMoveSection(direction: 'up' | 'down') {
    this.moveSection.emit({ sectionId: this.component().id, direction });
  }

  toggleResizeMode(event: MouseEvent) {
      event.stopPropagation();
      this.isShowingResizeUI.update(v => !v);
  }

  // --- Row Resizing ---

  onRowResizeStart(event: MouseEvent) {
      if (!this.isShowingResizeUI()) return;
      event.preventDefault();
      event.stopPropagation();
      this.isRowResizing.set(true);
      this.resizeStartY = event.clientY;
      this.initialRowCount = this.component().settings?.design.grid.rowCount || 16;
      
      document.addEventListener('mousemove', this.onRowResizeMove);
      document.addEventListener('mouseup', this.onRowResizeEnd);
  }

  private onRowResizeMove = (event: MouseEvent) => {
      if (!this.isRowResizing()) return;
      const dy = event.clientY - this.resizeStartY;
      const rowHeight = this.grid.cellH + this.grid.gap;
      const rowDelta = Math.round(dy / rowHeight);
      
      const newRowCount = Math.max(4, this.initialRowCount + rowDelta);
      
      const currentSettings = this.component().settings || this.state.getDefaultSettings();
      
      this.state.updateComponentSettings(this.component().id, {
          ...currentSettings,
          design: {
              ...currentSettings.design,
              grid: {
                  ...currentSettings.design.grid,
                  rowCount: newRowCount
              }
          }
      });
  }

  private onRowResizeEnd = () => {
      this.isRowResizing.set(false);
      this.rowResizeEnd.emit();
      document.removeEventListener('mousemove', this.onRowResizeMove);
      document.removeEventListener('mouseup', this.onRowResizeEnd);
  }

  // --- Drag & Drop ---

  onDragEnter(event: DragEvent) {
      if (this.editorStore.draggedBlockInfo()) {
        this.isActiveDrop.set(true);
      }
  }

  onDragOver(event: DragEvent) {
    // Only accept block drops
    if (!this.editorStore.draggedBlockInfo()) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Calculate Grid Position
    const draggedInfo = this.editorStore.draggedBlockInfo()!;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    
    const { x, y } = this.gridSnapService.getGridPosition(
        event.clientX, 
        event.clientY, 
        rect, 
        this.grid, 
        draggedInfo.offsetX, 
        draggedInfo.offsetY
    );

    const rowCount = this.component().settings?.design.grid.rowCount || 16;
    const clamped = this.gridSnapService.clampToBoundaries(
        x, y, draggedInfo.w, draggedInfo.h, rect.width, rowCount, this.grid
    );

    this.dropIndicator.set({ 
        x: clamped.x, 
        y: clamped.y, 
        w: draggedInfo.w, 
        h: draggedInfo.h, 
        type: draggedInfo.type 
    });
  }

  onDragLeave(event: DragEvent) {
      // Check if leaving the main container
      if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) return;
      this.isActiveDrop.set(false);
      this.dropIndicator.set(null);
  }

  onDrop(event: DragEvent) {
    const info = this.editorStore.draggedBlockInfo();
    const pos = this.dropIndicator();

    if (info && pos) {
        event.preventDefault();
        event.stopPropagation();

        const blockId = event.dataTransfer?.getData('blockId');
        const sourceSectionId = event.dataTransfer?.getData('sourceSectionId');

        if (blockId && sourceSectionId) {
            // Move existing block
            this.state.moveBlockToSection(sourceSectionId, this.component().id, blockId, pos.x, pos.y);
        } else {
            // New block
            this.state.addBlockToComponent(this.component().id, info.type, { x: pos.x, y: pos.y, w: pos.w, h: pos.h });
        }
        
        // Ensure new block is within bounds (if grid expanded)
        const rowCount = this.component().settings?.design.grid.rowCount || 16;
        if (pos.y + pos.h > rowCount) {
             const currentSettings = this.component().settings || this.state.getDefaultSettings();
             this.state.updateComponentSettings(this.component().id, {
                ...currentSettings,
                design: {
                    ...currentSettings.design,
                    grid: { ...currentSettings.design.grid, rowCount: pos.y + pos.h + 2 }
                }
             });
        }
    }

    this.isActiveDrop.set(false);
    this.dropIndicator.set(null);
    this.editorStore.draggedBlockInfo.set(null);
    this.editorStore.isDragging.set(false);
  }

  // --- Block Events ---

  onBlockSelect(blockId: string, event: MouseEvent) {
    this.blockSelect.emit(blockId);
  }

  onBlockEdit(blockId: string, event: MouseEvent) {
    this.blockEdit.emit(blockId);
  }

  onStopEdit() {
    this.blockStopEdit.emit();
  }

  onBlockRemove(blockId: string) {
    this.blockRemove.emit({ sectionId: this.component().id, blockId });
  }

  onBlockUpdate(blockId: string, updates: Partial<Block>) {
      this.blockUpdate.emit({ sectionId: this.component().id, blockId, updates });
  }

  onBlockResizeEnd() {
    this.isBlockResizing.set(false);
    this.blockResizeEnd.emit();
  }

  onBlockContextMenu(event: MouseEvent, blockId: string) {
    this.blockContextMenu.emit({ event, blockId });
  }
  
  // --- Layers Panel ---
  toggleLayersPanel(event: MouseEvent) {
    event.stopPropagation();
    this.showLayersPanel.update(v => !v);
  }

  onLayerSelect(blockId: string) {
    this.blockSelect.emit(blockId);
  }
}
