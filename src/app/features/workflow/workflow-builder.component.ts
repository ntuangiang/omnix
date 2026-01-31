
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { AiService } from '../../core/ai/ai.service';
import { WorkflowCanvasComponent } from './components/workflow-canvas/workflow-canvas.component';
import { WorkflowSidebarComponent } from './components/workflow-sidebar/workflow-sidebar.component';
import { WorkflowContextMenuComponent, ContextMenu } from './components/workflow-context-menu/workflow-context-menu.component';
import { ClickOutsideDirective } from '../../core/directives/click-outside.directive';
import { WorkflowCanvasService } from './services/workflow-canvas.service';

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WorkflowCanvasComponent,
    WorkflowSidebarComponent,
    WorkflowContextMenuComponent,
    ClickOutsideDirective
  ],
  template: `
    <div class="flex h-full bg-slate-50 overflow-hidden relative">
      <app-workflow-canvas 
        (canvasDrop)="onCanvasDrop($event)"
        (contextMenu)="openContextMenu($event)"
        (connectionDrop)="onConnectionDrop($event)"
        (addNodeOnConnection)="addNodeOnConnection($event)">
      </app-workflow-canvas>
      
      <app-workflow-sidebar></app-workflow-sidebar>

      <div (appClickOutside)="closeContextMenu()">
        <app-workflow-context-menu 
          [menu]="contextMenu()"
          (menuAction)="handleMenuAction($event)">
        </app-workflow-context-menu>
      </div>
    </div>
  `
})
export class WorkflowBuilderComponent {
  state = inject(StateService);
  ai = inject(AiService);

  contextMenu = signal<ContextMenu | null>(null);
  
  constructor() {
    // Effect to focus node when requested from state
    effect(() => {
      const focusId = this.state.focusedNodeId();
      if (focusId) {
         // The canvas service/directive would handle the pan/zoom animation
         // For now, this logic is simplified.
         this.state.selectedNodeId.set(focusId);
         setTimeout(() => this.state.focusedNodeId.set(null), 100);
      }
    });
  }

  onCanvasDrop(event: { type: string, x: number, y: number }) {
    this.state.addNode(event.type as any, event.x, event.y);
  }

  openContextMenu(ctx: { event: MouseEvent, type: any, targetId?: string, data?: any }) {
    this.contextMenu.set({
      x: ctx.event.clientX,
      y: ctx.event.clientY,
      type: ctx.type,
      targetId: ctx.targetId,
      data: ctx.data,
    });
  }

  closeContextMenu() {
    this.contextMenu.set(null);
  }

  handleMenuAction(action: any) {
    switch (action.action) {
      case 'duplicate': this.state.duplicateNode(action.id); break;
      case 'breakpoint': this.state.toggleBreakpoint(action.id); break;
      case 'deleteNode': this.state.removeNode(action.id); break;
      case 'deleteConnection': this.state.removeConnection(action.data.sourceId, action.data.targetId); break;
      case 'addNode': this.state.addNode(action.type, action.pos.x, action.pos.y); break; // Position needs world coords
    }
    this.closeContextMenu();
  }

  onConnectionDrop(event: { type: string, sourceId: string, targetId: string }) {
      this.state.insertNodeBetween(event.sourceId, event.targetId, event.type as any, 0, 0); // Position needs calc
  }

  async addNodeOnConnection(conn: any) {
      const suggestion = await this.ai.suggestNodeBetween(conn.sourceType, conn.targetType);
      this.state.insertNodeBetween(conn.sourceId, conn.targetId, suggestion as any, conn.midX - 96, conn.midY - 40);
  }
}
