import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowNode } from '../../state/workflow.store';
import { WorkflowCanvasService } from '../../services/workflow-canvas.service';

interface RenderedConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceType: string;
  targetType: string;
  path: string;
  label: string | null;
  midX: number;
  midY: number;
}

@Component({
  selector: 'app-workflow-connections',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
        </defs>
        
        @for (conn of renderedConnections(); track conn.id) {
            <g (dragover)="onConnectionDragOver($event, conn)"
               (drop)="onDrop($event, conn)"
               (contextmenu)="onContextMenu(conn, $event)">
                
                <path [attr.d]="conn.path" stroke="transparent" stroke-width="30" fill="none" class="pointer-events-auto cursor-pointer" />
                
                <path [attr.d]="conn.path" 
                      [attr.stroke]="hoveredConnectionId() === conn.id ? '#3b82f6' : '#94a3b8'" 
                      stroke-width="2" fill="none" marker-end="url(#arrowhead)"
                      class="transition-all duration-300 pointer-events-none"
                      style="filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.1));" />

                <g [attr.transform]="'translate(' + conn.midX + ',' + conn.midY + ')'"
                   class="cursor-pointer pointer-events-auto hover:scale-110 transition-transform group/add"
                   (click)="addNode.emit(conn)">
                    <circle r="12" fill="white" stroke="#e2e8f0" stroke-width="1" class="shadow-sm group-hover/add:stroke-blue-400"></circle>
                    <text text-anchor="middle" dy="4" font-size="16" fill="#64748b" class="group-hover/add:fill-blue-500 font-bold">+</text>
                </g>

                @if (conn.label) {
                    <rect [attr.x]="conn.midX - 16" [attr.y]="conn.midY - 24" width="32" height="16" rx="4" 
                          [attr.fill]="conn.label === 'True' ? '#dcfce7' : '#fee2e2'" stroke="#e2e8f0" />
                    <text [attr.x]="conn.midX" [attr.y]="conn.midY - 13" text-anchor="middle" 
                          class="text-[10px] font-bold font-mono"
                          [attr.fill]="conn.label === 'True' ? '#166534' : '#991b1b'">{{ conn.label }}</text>
                }
            </g>
        }
        
        @if (draftConnection(); as draft) {
            <path [attr.d]="draft.path" [attr.stroke]="draft.color" stroke-width="3" 
                  stroke-dasharray="5,5" fill="none" marker-end="url(#arrowhead)" />
        }
    </svg>
  `
})
export class WorkflowConnectionsComponent {
  nodes = input.required<WorkflowNode[]>();
  // Fix: Strongly type the data property in the output event
  contextmenu = output<{ event: MouseEvent; id: string; data: RenderedConnection }>();
  connectionDrop = output<{ dragEvent: DragEvent, sourceId: string, targetId: string }>();
  // FIX: Using a specific type for the output instead of 'any' to improve type safety and prevent potential type inference issues.
  addNode = output<RenderedConnection>();

  canvasService = inject(WorkflowCanvasService);
  hoveredConnectionId = signal<string | null>(null);

  draftConnection = computed(() => this.canvasService.draftConnection());

  renderedConnections = computed<RenderedConnection[]>(() => {
    const nodes = this.nodes();
    // Fix: Explicitly type the Map to aid TypeScript's type inference, which was failing to resolve the type of 'target'.
    const nodeMap = new Map<string, WorkflowNode>(nodes.map(n => [n.id, n]));
    const connections: RenderedConnection[] = [];

    // Fix: Explicitly type the forEach callback parameter to prevent it from being inferred as 'unknown'.
    nodes.forEach((source: WorkflowNode) => {
      source.connections.forEach((targetId, index) => {
        const target = nodeMap.get(targetId);
        if (target) {
          const portId = source.outputs?.[targetId] || 'bottom';
          const { x: sX, y: sY } = this.getPortPosition(source.x, source.y, portId);
          const tX = target.x + 96;
          const tY = target.y;

          connections.push({
            id: `${source.id}-${target.id}`,
            sourceId: source.id,
            targetId: target.id,
            sourceType: source.type,
            targetType: target.type,
            path: this.getBezierPath(sX, sY, tX, tY, portId),
            label: source.type === 'if' ? (index === 0 ? 'True' : 'False') : null,
            midX: (sX + tX) / 2,
            midY: (sY + tY) / 2,
          });
        }
      });
    });
    return connections;
  });

  onConnectionDragOver(event: DragEvent, conn: RenderedConnection) {
    event.preventDefault();
    event.stopPropagation();
    if(event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.hoveredConnectionId.set(conn.id);
  }

  onDrop(event: DragEvent, conn: RenderedConnection) {
    this.hoveredConnectionId.set(null);
    this.connectionDrop.emit({ dragEvent: event, sourceId: conn.sourceId, targetId: conn.targetId });
  }

  onContextMenu(conn: RenderedConnection, event: MouseEvent) {
    this.contextmenu.emit({ event, id: conn.id, data: conn });
  }

  private getPortPosition(nodeX: number, nodeY: number, portId: string): { x: number; y: number } {
    switch (portId) {
      case 'right': return { x: nodeX + 192, y: nodeY + 40 };
      case 'left': return { x: nodeX, y: nodeY + 40 };
      case 'bottom':
      default: return { x: nodeX + 96, y: nodeY + 80 };
    }
  }

  private getBezierPath(x1: number, y1: number, x2: number, y2: number, sourceSide: string): string {
    const curve = Math.min((Math.abs(y2 - y1) + Math.abs(x2 - x1)) * 0.5, 150);
    let cp1x = x1, cp1y = y1, cp2x = x2, cp2y = y2 - 50;

    if (sourceSide === 'right') cp1x = x1 + curve;
    else if (sourceSide === 'left') cp1x = x1 - curve;
    else cp1y = y1 + curve;

    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }
}
