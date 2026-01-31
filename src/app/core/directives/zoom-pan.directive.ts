
import { Directive, ElementRef, inject, HostListener } from '@angular/core';
import { WorkflowCanvasService } from '../../features/workflow/services/workflow-canvas.service';

@Directive({
  selector: '[appZoomPan]',
  standalone: true,
})
export class ZoomPanDirective {
  private canvasService = inject(WorkflowCanvasService);
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private isPanning = false;

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();
    const sensitivity = 0.1;
    const direction = event.deltaY > 0 ? -1 : 1;
    this.canvasService.zoomOnPoint(
      direction * sensitivity, 
      event.clientX, 
      event.clientY, 
      this.elementRef.nativeElement.getBoundingClientRect()
    );
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button === 0 || event.button === 1) { // Left or middle mouse button
        const target = event.target as HTMLElement;
        // Only pan if clicking on the canvas background itself, not on child elements.
        if (target === this.elementRef.nativeElement || target.tagName === 'svg' || target.tagName === 'g') {
            this.isPanning = true;
            this.elementRef.nativeElement.style.cursor = 'grabbing';
        }
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      this.canvasService.panBy(event.movementX, event.movementY);
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
      this.elementRef.nativeElement.style.cursor = 'grab';
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
      this.isPanning = false;
      this.elementRef.nativeElement.style.cursor = 'grab';
  }
}
