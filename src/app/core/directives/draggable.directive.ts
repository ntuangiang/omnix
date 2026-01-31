
import { Directive, ElementRef, inject, output, HostListener } from '@angular/core';
import { WorkflowCanvasService } from '../../features/workflow/services/workflow-canvas.service';

@Directive({
  selector: '[appDraggable]',
  standalone: true,
})
export class DraggableDirective {
  dragStart = output<void>();
  dragMove = output<{ dx: number; dy: number }>();
  dragEnd = output<void>();

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private canvasService = inject(WorkflowCanvasService);
  
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;
    event.preventDefault();
    
    const scale = this.canvasService.zoom();
    const dx = (event.clientX - this.startX) / scale;
    const dy = (event.clientY - this.startY) / scale;
    
    this.startX = event.clientX;
    this.startY = event.clientY;

    this.dragMove.emit({ dx, dy });
  };

  private onMouseUp = (event: MouseEvent) => {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.dragEnd.emit();
    
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('.no-drag')) return;
    
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.dragStart.emit();

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }
}
