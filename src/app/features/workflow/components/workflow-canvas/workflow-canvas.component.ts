
import { Component, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../../core/services/state.service';
// Fix: Import WorkflowNode from its definition file.
import { WorkflowNode } from '../../state/workflow.store';
import { WorkflowCanvasService } from '../../services/workflow-canvas.service';
import { ZoomPanDirective } from '../../../../core/directives/zoom-pan.directive';
import { WorkflowNodeComponent } from '../workflow-node/workflow-node.component';
import { WorkflowConnectionsComponent } from '../workflow-connections/workflow-connections.component';

@Component({
  selector: 'app-workflow-canvas',
  standalone: true,
  imports: [CommonModule, ZoomPanDirective, WorkflowNodeComponent, WorkflowConnectionsComponent],
  providers: [WorkflowCanvasService],
  template: `
    <div class="flex-1 relative overflow-hidden bg-slate-100 cursor-grab"
        appZoomPan
        (dragover)="onDragOver($event)"
        (drop)="onCanvasDrop($event)"
        (contextmenu)="onContextMenu($event, 'canvas')">
           
        <div class="absolute top-0 left-0 w-full h-full origin-top-left will-change-transform"
            [style.transform]="transformStyle()">
              
            <div class="absolute -top-[5000px] -left-[5000px] w-[10000px] h-[10000px] grid-bg pointer-events-none opacity-50"></div>

            <app-workflow-connections 
                [nodes]="state.activeNodes()"
                (contextmenu)="onContextMenu($event, 'connection', $event.id, $event.data)"
                (connectionDrop)="onConnectionDrop($event)"
                (addNode)="addNodeOnConnection.emit($event)">
            </app-workflow-connections>

            @for (node of state.activeNodes(); track node.id) {
                <app-workflow-node 
                    [node]="node"
                    (contextmenu)="onContextMenu($event, 'node', node.id)">
                </app-workflow-node>
            }
        </div>
    </div>
  `
})
export class WorkflowCanvasComponent {
  state = inject(StateService);
  canvasService = inject(WorkflowCanvasService);

  // Outputs to the main builder component
  canvasDrop = output<{ type: string, x: number, y: number }>();
  contextMenu = output<any>();
  connectionDrop = output<{ type: string, sourceId: string, targetId: string }>();
  addNodeOnConnection = output<any>();

  transformStyle = computed(() => {
    const pan = this.canvasService.pan();
    const zoom = this.canvasService.zoom();
    return `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  });

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
    }
  }

  onCanvasDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const type = event.dataTransfer?.getData('type') as any;
    
    if (type && this.state.activeWorkflowId()) {
      const { x, y } = this.canvasService.screenToWorld(event.clientX, event.clientY);
      this.canvasDrop.emit({ type, x, y });
    }
  }
  
  onContextMenu(event: MouseEvent, type: 'node' | 'connection' | 'canvas', targetId?: string, data?: any) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.emit({ event, type, targetId, data });
  }

  onConnectionDrop(event: { dragEvent: DragEvent, sourceId: string, targetId: string }) {
    event.dragEvent.preventDefault();
    event.dragEvent.stopPropagation();
    const type = event.dragEvent.dataTransfer?.getData('type');
    if (type) {
        this.connectionDrop.emit({ type, sourceId: event.sourceId, targetId: event.targetId });
    }
  }
}
