
import { Component, input, output, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block, BackgroundStyle } from '../../domain/models/block.model';
import { GridConfig } from '../../domain/models/builder-document.model';
import { GridSnapService } from '../../dnd/grid-snap.service';
import { BlockToolbarComponent } from '../selection/block-toolbar.component';
import { TextBlockComponent } from '../blocks/text-block.component';
import { ButtonBlockComponent } from '../blocks/button-block.component';
import { ImageBlockComponent } from '../blocks/image-block.component';
import { StateService } from '../../../../../core/services/state.service';
import { BlockResizeDirective } from '../dnd/block-resize.directive';
import { rgbaToCss } from '../../../../../core/utils/color-utils';
import { TextEditToolbarComponent } from '../selection/text-edit-toolbar.component';

@Component({
  selector: 'app-block-host',
  standalone: true,
  imports: [
    CommonModule,
    TextBlockComponent,
    ButtonBlockComponent,
    ImageBlockComponent,
    BlockToolbarComponent,
    BlockResizeDirective,
    TextEditToolbarComponent
  ],
  template: `
    <div class="absolute z-20 group/block overflow-visible" 
         appBlockResize
         [gridConfig]="gridConfig()"
         [currentBlock]="block()"
         (resizeStart)="onResizeStart()"
         (resizeUpdate)="blockUpdate.emit($event)"
         (resizeEnd)="onResizeEnd()"
         [class.z-[60]]="isEditing() || isSelected()"
         [class.cursor-grab]="isSelected() && !isEditing()"
         [class.active:cursor-grabbing]="isSelected() && !isEditing()"
         [class.select-none]="isSelected() && !isEditing()"
         [style.left.px]="xPx()" 
         [style.top.px]="yPx()"
         [style.width.px]="wPx()"
         [style.height.px]="hPx()"
         [attr.draggable]="!isEditing()"
         (dragstart)="onDragStart($event)"
         (dragend)="onDragEnd($event)"
         (click)="onBlockClick($event)"
         (dblclick)="onDoubleClick($event)"
         (contextmenu)="onContextMenu($event)"
         (mouseenter)="isHovered.set(true)"
         (mouseleave)="isHovered.set(false)">
        
        <!-- MODE 1: HOVER STATE (Only when NOT selected and NOT editing) -->
        @if (!isSelected() && !isEditing() && isHovered()) {
            <!-- Hover Border -->
            <div class="absolute -inset-[2px] border-2 border-blue-400 rounded-sm pointer-events-none z-30 opacity-60"></div>
            <!-- Hover Label -->
            <div class="absolute -top-6 left-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-sm uppercase tracking-wider z-30 shadow-sm pointer-events-none">
                {{ block().type }}
            </div>
        }

        <!-- Inner container with style bindings -->
        <div class="w-full h-full relative z-10 transition-all duration-200"
             [class.pointer-events-none]="!isEditing()"
             [style]="containerStyle()">
             
            @switch (block().type) {
                @case ('text') {
                    <app-text-block 
                        [class.pointer-events-auto]="isEditing()"
                        [block]="block()" 
                        [isEditing]="isEditing()"
                        (contentChange)="blockUpdate.emit({ content: $event })"
                        (stopEdit)="stopEdit.emit()"
                    ></app-text-block>
                }
                @case ('button') { <app-button-block [block]="block()"></app-button-block> }
                @case ('image') { <app-image-block [block]="block()"></app-image-block> }
                @default {
                    <div class="w-full h-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                        <span class="text-[10px] font-bold uppercase">{{ block().type }}</span>
                    </div>
                }
            }
        </div>

        <!-- MODE 2 & 3: Selected or Editing -->
        @if (isSelected() || isEditing()) {
            <!-- Frame & Resize Handles (via BlockToolbar) -->
            <app-block-toolbar
                class="absolute inset-0 z-50 pointer-events-none"
                [blockType]="block().type"
                [isEditing]="isEditing()"
                (command)="onToolbarCommand($event)"
                (editModeToggle)="onEditModeToggle()"
                (delete)="remove.emit()"
                (resizeStart)="onToolbarResizeStart($event)">
            </app-block-toolbar>
        }

        <!-- Text Editing Toolbar (Local to Block) -->
        @if (isEditing()) {
            <div class="absolute -top-14 left-0 pointer-events-auto z-[70] min-w-[300px]">
                <app-text-edit-toolbar></app-text-edit-toolbar>
            </div>
        }
    </div>
  `
})
export class BlockHostComponent {
  state = inject(StateService);
  gridSnapService = inject(GridSnapService);
  
  textBlock = viewChild(TextBlockComponent);
  resizeDirective = viewChild.required(BlockResizeDirective);

  block = input.required<Block>();
  sectionId = input.required<string>();
  isSelected = input.required<boolean>();
  isEditing = input.required<boolean>();
  gridConfig = input.required<GridConfig>();

  select = output<MouseEvent>();
  edit = output<MouseEvent>();
  remove = output<void>();
  stopEdit = output<void>();
  showProperties = output<void>();
  openStyleBackground = output<void>(); 
  blockUpdate = output<Partial<Block>>();
  resizeStart = output<void>();
  resizeEnd = output<void>();
  contextmenu = output<MouseEvent>();

  isHovered = signal(false);
  isResizing = signal(false);

  xPx = computed(() => this.gridSnapService.getPx(this.block().x, 'x', this.gridConfig()));
  yPx = computed(() => this.gridSnapService.getPx(this.block().y, 'y', this.gridConfig()));
  wPx = computed(() => this.gridSnapService.getPx(this.block().w, 'w', this.gridConfig()));
  hPx = computed(() => this.gridSnapService.getPx(this.block().h, 'h', this.gridConfig()));

  containerStyle = computed(() => {
     const s = this.block().style;
     if (!s) return {};
     
     const styles: Record<string, string> = {};
     
     if (s.enabled && s.color) {
        styles['backgroundColor'] = rgbaToCss(s.color);
     }
     if (s.cornerRadius) {
        styles['borderRadius'] = `${s.cornerRadius}px`;
     }
     
     if (s.stroke && s.stroke !== 'none') {
        styles['border'] = `2px ${s.stroke} currentColor`; 
        styles['borderColor'] = 'rgba(0,0,0,0.1)'; 
     }

     if (s.paddingPreset === 'CUSTOM') {
         styles['padding'] = `${s.paddingTopBottomPct ?? 6}% ${s.paddingLeftRightPct ?? 6}%`;
     } else if (s.paddingPreset) {
         const p = s.paddingPreset === 'S' ? '8px' : s.paddingPreset === 'M' ? '16px' : s.paddingPreset === 'L' ? '24px' : '0px';
         styles['padding'] = p;
     }
     
     if (s.blendMode && s.blendMode !== 'normal') {
         styles['mixBlendMode'] = s.blendMode;
     }

     if (s.blurEnabled) {
         styles['backdropFilter'] = 'blur(8px)';
     }

     return styles;
  });

  onBlockClick(event: MouseEvent) {
      event.stopPropagation();
      if (!this.isEditing()) {
        this.select.emit(event);
      }
  }

  onEditModeToggle() {
    if (this.isEditing()) {
        this.stopEdit.emit();
    } else {
        const mockEvent = { stopPropagation: () => {}, preventDefault: () => {} } as unknown as MouseEvent;
        this.edit.emit(mockEvent); 
    }
  }

  onDoubleClick(event: MouseEvent) {
      if (this.block().type === 'text') {
          this.edit.emit(event);
      } else {
          this.showProperties.emit();
      }
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.contextmenu.emit(event);
  }

  onToolbarCommand(cmd: string) {
      if (cmd === 'show-properties') {
          this.showProperties.emit();
      } else if (cmd === 'open-style-background') {
          this.openStyleBackground.emit();
      } else if (cmd === 'duplicate') {
          this.state.duplicateBlock(this.sectionId(), this.block().id);
      } else if (cmd === 'bring-forward') {
          this.state.moveBlockInStack(this.sectionId(), this.block().id, 'forward');
      } else if (cmd === 'send-backward') {
          this.state.moveBlockInStack(this.sectionId(), this.block().id, 'backward');
      }
  }

  onDragStart(event: DragEvent) {
      if (this.isEditing() || this.isResizing()) {
          event.preventDefault();
          return;
      }

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      
      this.state.isDragging.set(true);
      const b = this.block();
      this.state.editorStore.draggedBlockInfo.set({ 
        type: b.type, 
        w: b.w, 
        h: b.h,
        offsetX,
        offsetY
      });
      
      if (event.dataTransfer) {
          event.dataTransfer.setData('blockType', b.type);
          event.dataTransfer.setData('blockW', b.w.toString());
          event.dataTransfer.setData('blockH', b.h.toString());
          event.dataTransfer.setData('blockId', b.id);
          event.dataTransfer.setData('sourceSectionId', this.sectionId());
          event.dataTransfer.effectAllowed = 'move';
      }
      event.stopPropagation();
  }

  onDragEnd(event: DragEvent) {
      this.state.isDragging.set(false);
      this.state.editorStore.draggedBlockInfo.set(null);
  }

  onToolbarResizeStart(event: { event: MouseEvent, direction: string }) {
    this.resizeDirective().startResize(event.event, event.direction);
  }

  onResizeStart() {
    this.isResizing.set(true);
    this.resizeStart.emit();
  }

  onResizeEnd() {
    this.isResizing.set(false);
    this.resizeEnd.emit();
  }
}
