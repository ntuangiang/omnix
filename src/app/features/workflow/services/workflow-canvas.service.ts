
import { Injectable, signal, computed } from '@angular/core';

@Injectable()
export class WorkflowCanvasService {
  zoom = signal(1);
  pan = signal({ x: 0, y: 0 });

  connectingPort = signal<{ id: string, type: string } | null>(null);
  mousePosWorld = signal({ x: 0, y: 0 });

  panBy(dx: number, dy: number) {
    this.pan.update(p => ({ x: p.x + dx, y: p.y + dy }));
  }

  zoomOnPoint(delta: number, clientX: number, clientY: number, canvasRect: DOMRect) {
    const newZoom = Math.min(Math.max(0.2, this.zoom() + delta * this.zoom()), 2);
    const zoomFactor = newZoom / this.zoom();
    
    const mouseX = clientX - canvasRect.left;
    const mouseY = clientY - canvasRect.top;

    this.pan.update(p => ({
      x: mouseX - (mouseX - p.x) * zoomFactor,
      y: mouseY - (mouseY - p.y) * zoomFactor
    }));
    this.zoom.set(newZoom);
  }

  screenToWorld(clientX: number, clientY: number) {
    const p = this.pan();
    const z = this.zoom();
    // This assumes the canvas is full screen. A DOMRect should be passed for accuracy.
    return {
      x: (clientX - p.x) / z,
      y: (clientY - p.y) / z,
    };
  }

  startConnecting(nodeId: string, portType: string, event: MouseEvent) {
    this.connectingPort.set({ id: nodeId, type: portType });
    this.mousePosWorld.set(this.screenToWorld(event.clientX, event.clientY));
  }

  finishConnecting(nodeId: string, portType: string) {
    // Connection logic will be handled by the main builder component
    // which listens to events and uses the store.
    this.connectingPort.set(null);
  }

  updateMousePosition(event: MouseEvent) {
      if(this.connectingPort()) {
          this.mousePosWorld.set(this.screenToWorld(event.clientX, event.clientY));
      }
  }

  readonly draftConnection = computed(() => {
    const start = this.connectingPort();
    if (!start) return null;
    
    // Simplified logic. The connections component will need the full node list to calculate start positions.
    const m = this.mousePosWorld();
    return { 
        path: `M ${m.x-100} ${m.y-100} L ${m.x} ${m.y}`,
        color: '#3b82f6',
    };
  });
}
