
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../../core/services/state.service';

@Component({
  selector: 'app-workflow-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-80 bg-white border-l border-slate-200 flex flex-col z-20 shadow-sm h-full">
      <div class="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
        <div class="flex bg-slate-200 rounded p-1">
          <button (click)="state.workflowScope.set('server')" [class.bg-white]="state.workflowScope() === 'server'" class="flex-1 py-1.5 text-xs font-bold rounded text-slate-600">Server</button>
          <button (click)="state.workflowScope.set('client')" [class.bg-white]="state.workflowScope() === 'client'" class="flex-1 py-1.5 text-xs font-bold rounded text-slate-600">Client</button>
        </div>
        <!-- Debug Toolbar remains here -->
      </div>
      
      <div class="flex-1 overflow-y-auto border-b border-slate-200 bg-slate-50 flex flex-col min-h-0">
          <!-- Workflow List -->
          <div class="p-2 space-y-1 max-h-48 overflow-y-auto">
              @for (wf of state.visibleWorkflows(); track wf.id) {
                  <div (click)="state.activeWorkflowId.set(wf.id); state.selectedNodeId.set(null)"
                       class="px-3 py-2 rounded flex items-center justify-between cursor-pointer"
                       [class.bg-white]="state.activeWorkflowId() === wf.id"
                       [class.hover:bg-slate-100]="state.activeWorkflowId() !== wf.id">
                      <span class="text-xs font-medium truncate text-slate-700">{{ wf.name }}</span>
                  </div>
              }
              <button (click)="createNewWorkflow()" class="w-full py-2 text-xs text-blue-600 font-medium hover:bg-blue-50 rounded border border-dashed border-blue-200">+ New Function</button>
          </div>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden bg-white min-h-0">
        @if (state.selectedNode(); as node) {
          <div class="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-xs font-medium text-slate-500">Label</label>
              <input type="text" [ngModel]="node.label" (ngModelChange)="state.updateNode(node.id, {label: $event})" class="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none">
            </div>
          </div>
        } @else if (state.activeWorkflow(); as wf) {
          <!-- Toolbox and Params -->
          <div class="p-4">
             <h3 class="font-bold mb-2">Toolbox</h3>
             <div class="space-y-2">
                @for (tool of tools; track tool.type) {
                    <div draggable="true" (dragstart)="onToolDragStart($event, tool.type)"
                         class="p-2 bg-slate-100 border border-slate-200 rounded cursor-grab">
                         {{tool.name}}
                    </div>
                }
             </div>
          </div>
        }
      </div>
    </div>
  `
})
export class WorkflowSidebarComponent {
  state = inject(StateService);

  tools = [
    { type: 'assign', name: 'Assign' },
    { type: 'if', name: 'If / Else' },
    { type: 'action', name: 'Action' },
    { type: 'return', name: 'Return' },
  ];

  createNewWorkflow() {
      const name = `NewFunction_${Date.now().toString().slice(-4)}`;
      const id = this.state.createWorkflow(name, this.state.workflowScope());
      this.state.activeWorkflowId.set(id);
  }

  onToolDragStart(event: DragEvent, type: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('type', type);
      event.dataTransfer.effectAllowed = 'copy';
    }
  }
}
