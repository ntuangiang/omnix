
import { Directive, input, output } from '@angular/core';
import { GridConfig } from '../../domain/models/builder-document.model';
import { Block } from '../../domain/models/block.model';

@Directive({
  selector: '[appBlockResize]',
  standalone: true
})
export class BlockResizeDirective {
  gridConfig = input.required<GridConfig>();
  currentBlock = input.required<Block>();

  resizeStart = output<void>();
  resizeUpdate = output<Partial<Block>>();
  resizeEnd = output<void>();

  private initialMousePos = { x: 0, y: 0 };
  private initialBlockRect = { x: 0, y: 0, w: 0, h: 0 };
  private resizeDirection: string | null = null;
  private isResizing = false;

  startResize(event: MouseEvent, direction: string) {
    event.preventDefault();
    event.stopPropagation();
    
    this.isResizing = true;
    this.resizeDirection = direction;
    this.initialMousePos = { x: event.clientX, y: event.clientY };
    const b = this.currentBlock();
    this.initialBlockRect = { x: b.x, y: b.y, w: b.w, h: b.h };
    
    this.resizeStart.emit();

    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd, { once: true });
  }

  private onResizeMove = (event: MouseEvent) => {
    if (!this.isResizing) return;
    
    const dx = event.clientX - this.initialMousePos.x;
    const dy = event.clientY - this.initialMousePos.y;

    const config = this.gridConfig();
    const colWidth = config.cellW + config.gap;
    const rowHeight = config.cellH + config.gap;

    const dw = Math.round(dx / colWidth);
    const dh = Math.round(dy / rowHeight);

    let { x, y, w, h } = this.initialBlockRect;
    let newX = x, newY = y, newW = w, newH = h;

    if (this.resizeDirection?.includes('e')) {
        newW = Math.max(1, this.initialBlockRect.w + dw);
    }
    if (this.resizeDirection?.includes('w')) {
        newW = Math.max(1, this.initialBlockRect.w - dw);
        const actualDw = this.initialBlockRect.w - newW;
        newX = this.initialBlockRect.x + actualDw;
    }
    if (this.resizeDirection?.includes('s')) {
        newH = Math.max(1, this.initialBlockRect.h + dh);
    }
    if (this.resizeDirection?.includes('n')) {
        newH = Math.max(1, this.initialBlockRect.h - dh);
        const actualDh = this.initialBlockRect.h - newH;
        newY = this.initialBlockRect.y + actualDh;
    }

    const updates: Partial<Block> = {};
    if (newX !== this.currentBlock().x) updates.x = newX;
    if (newY !== this.currentBlock().y) updates.y = newY;
    if (newW !== this.currentBlock().w) updates.w = newW;
    if (newH !== this.currentBlock().h) updates.h = newH;

    if (Object.keys(updates).length > 0) {
      this.resizeUpdate.emit(updates);
    }
  }

  private onResizeEnd = () => {
    if (!this.isResizing) return;
    this.isResizing = false;
    this.resizeDirection = null;
    document.removeEventListener('mousemove', this.onResizeMove);
    this.resizeEnd.emit();
  }
}
