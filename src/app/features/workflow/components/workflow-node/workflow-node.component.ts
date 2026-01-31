
import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../../core/services/state.service';
// Fix: Import WorkflowNode from its definition file.
import { WorkflowNode } from '../../state/workflow.store';
import { DraggableDirective } from '../../../../core/directives/draggable.directive';
import { WorkflowCanvasService } from '../../services/workflow-canvas.service';

@Component({
  selector: 'app-workflow-node',
  standalone: true,
  imports: [CommonModule, DraggableDirective],
  template: `
    <div 
        class="absolute w-48 bg-white rounded-lg border shadow-sm hover:shadow-xl transition-shadow group z-10 flex flex-col will-change-transform"
        [style.transform]="'translate(' + node().x + 'px, ' + node().y + 'px)'"
        [class.ring-4]="isSelected() || isCurrentExecutionStep()"
        [class.ring-blue-200]="isSelected()"
        [class.ring-yellow-400]="isCurrentExecutionStep()"
        [class.border-blue-500]="isSelected()"
        [class.border-slate-200]="!isSelected() && !isCurrentExecutionStep()"
        [class.border-yellow-500]="isCurrentExecutionStep()"
        appDraggable
        (dragStart)="onDragStart()"
        (dragMove)="onDragMove($event)"
        (click)="selectNode()"
    >
        <div class="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white cursor-pointer hover:scale-110 shadow-sm z-30 transition-opacity"
             [class.opacity-100]="node().isBreakpoint"
             [class.opacity-0]="!node().isBreakpoint"
             (click)="state.toggleBreakpoint(node().id); $event.stopPropagation()">
        </div>

        @if (node().type !== 'start') {
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair z-20 no-drag"
                 (mousedown)="onPortMouseDown($event, 'input')" (mouseup)="onPortMouseUp($event, 'input')">
                <div class="w-3 h-3 rounded-full border-2 border-slate-300 bg-white shadow-sm hover:border-blue-500 hover:bg-blue-50"></div>
            </div>
        }
        
        <div class="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 rounded-t-lg cursor-grab active:cursor-grabbing">
            <span class="text-xs font-bold text-slate-700 truncate select-none">{{ node().label }}</span>
        </div>

        <div class="p-2 bg-white rounded-b-lg">
            <div class="text-[10px] text-slate-500 truncate font-mono select-none">{{ getNodeSummary(node()) }}</div>
        </div>

        @if (node().type !== 'return') {
            @for (port of ['right', 'bottom', 'left']; track port) {
                <div class="absolute w-6 h-6 flex items-center justify-center cursor-crosshair z-20 no-drag"
                     [ngClass]="portPositions[port]"
                     (mousedown)="onPortMouseDown($event, port)">
                    <div class="w-3 h-3 rounded-full bg-slate-700 border border-white shadow-sm hover:bg-blue-600 hover:scale-110 transition-all"></div>
                </div>
            }
        }
    </div>
  `
})
export class WorkflowNodeComponent {
  state = inject(StateService);
  canvasService = inject(WorkflowCanvasService);
  
  node = input.required<WorkflowNode>();

  isSelected = computed(() => this.state.selectedNodeId() === this.node().id);
  isCurrentExecutionStep = computed(() => this.state.execution().currentNodeId === this.node().id);

  portPositions: Record<string, string> = {
    right: 'top-1/2 -right-3 -translate-y-1/2',
    bottom: '-bottom-3 left-1/2 -translate-x-1/2',
    left: 'top-1/2 -left-3 -translate-y-1/2',
  };

  onDragStart() {
    this.selectNode();
  }
  
  onDragMove(event: { dx: number; dy: number }) {
    const n = this.node();
    this.state.updateNodePosition(n.id, n.x + event.dx, n.y + event.dy);
  }

  selectNode() {
    this.state.selectedNodeId.set(this.node().id);
  }

  onPortMouseDown(event: MouseEvent, portType: string) {
    event.stopPropagation();
    this.canvasService.startConnecting(this.node().id, portType, event);
  }

  onPortMouseUp(event: MouseEvent, portType: string) {
    event.stopPropagation();
    this.canvasService.finishConnecting(this.node().id, portType);
  }

  getNodeSummary(node: WorkflowNode): string {
    const c = node.config || {};
    switch (node.type) {
      case 'assign': return `${c['targetVar'] || '?'} = ${c['expression'] || '?'}`;
      case 'if': return `if (${c['expression'] || '?'})`;
      case 'foreach': return `for (${c['iterator'] || 'i'} of ${c['collection'] || 'list'})`;
      case 'action': return c['query'] ? c['query'].slice(0, 20) + '...' : 'Execute...';
      default: return '...';
    }
  }
}
