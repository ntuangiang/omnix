
import { Component, input, output, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block } from '../../domain/models/block.model';

@Component({
  selector: 'app-layers-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-2 flex flex-col gap-1 animate-slide-down-fade">
        <h3 class="px-2 py-1 text-xs font-bold text-slate-800">Layers</h3>
        <div class="max-h-96 overflow-y-auto custom-scrollbar pr-1">
          @for (block of blocks(); track block.id) {
            <div 
              draggable="true"
              (dragstart)="onDragStart(block, $event)"
              (dragend)="onDragEnd()"
              (dragover)="onDragOver($event, block)"
              (dragleave)="onDragLeave()"
              (drop)="onDrop($event, block)"
              (click)="selectBlock.emit(block.id)"
              class="relative flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors group/layer"
              [class.bg-slate-100]="selectedBlockId() === block.id"
              [class.opacity-50]="draggedBlock()?.id === block.id">
              
              @if (dropIndicator()?.targetId === block.id) {
                <div class="absolute inset-x-0 h-0.5 bg-blue-500 pointer-events-none"
                    [class.top-0]="dropIndicator()?.position === 'before'"
                    [class.bottom-0]="dropIndicator()?.position === 'after'">
                </div>
              }
              
              <!-- Drag Handle Icon -->
              <div class="text-slate-300 group-hover/layer:text-slate-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>
              </div>

              <span class="text-slate-400">
                @switch (block.type) {
                  @case('image') {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  }
                  @case('button') {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="8" width="14" height="8" rx="2"/></svg>
                  }
                  @case('text') {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                  }
                }
              </span>
              <span class="text-sm text-slate-700 font-medium truncate">{{ getBlockLabel(block) }}</span>
            </div>
          }
          @if (!blocks()?.length) {
            <p class="text-xs text-slate-400 p-2 text-center">No blocks in this section.</p>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-down-fade {
      animation: slide-down-fade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slide-down-fade {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LayersPanelComponent {
  blocks = input.required<Block[]>();
  selectedBlockId = input.required<string | null>();
  isOpen = input.required<boolean>();

  close = output<void>();
  selectBlock = output<string>();
  reorderBlocks = output<Block[]>();

  draggedBlock = signal<Block | null>(null);
  dropIndicator = signal<{ targetId: string, position: 'before' | 'after' } | null>(null);

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey() {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  onDragStart(block: Block, event: DragEvent) {
    this.draggedBlock.set(block);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', block.id); // Necessary for Firefox
      event.dataTransfer.setData('application/x-nexus-layer-drag', 'true'); // Isolate this drag op
    }
  }

  onDragEnd() {
    this.draggedBlock.set(null);
    this.dropIndicator.set(null);
  }

  onDragOver(event: DragEvent, targetBlock: Block) {
    event.preventDefault();
    if (this.draggedBlock()?.id === targetBlock.id) return;
    
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    this.dropIndicator.set({
      targetId: targetBlock.id,
      position: event.clientY < midY ? 'before' : 'after'
    });
  }
  
  onDragLeave() {
    this.dropIndicator.set(null);
  }

  onDrop(event: DragEvent, targetBlock: Block) {
    event.preventDefault();
    const dragged = this.draggedBlock();
    if (!dragged || !this.dropIndicator()) return;

    const blocks = [...this.blocks()];
    const draggedIndex = blocks.findIndex(b => b.id === dragged.id);
    if (draggedIndex === -1) return;
    
    const [draggedItem] = blocks.splice(draggedIndex, 1);
    
    let targetIndex = blocks.findIndex(b => b.id === targetBlock.id);

    if (this.dropIndicator()?.position === 'after') {
      targetIndex++;
    }

    blocks.splice(targetIndex, 0, draggedItem);
    this.reorderBlocks.emit(blocks);
    
    this.onDragEnd();
  }

  getBlockLabel(block: Block): string {
    switch (block.type) {
      case 'text':
        if (typeof block.content !== 'string') return 'Text';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = block.content;
        const text = tempDiv.textContent || tempDiv.innerText || 'Text';
        const trimmedText = text.trim();
        return trimmedText ? (trimmedText.substring(0, 25) + (trimmedText.length > 25 ? '...' : '')) : 'Text';
      case 'button':
        return block.content?.label || 'Button';
      case 'image':
        return 'Image';
      default:
        return block.type.charAt(0).toUpperCase() + block.type.slice(1);
    }
  }
}
