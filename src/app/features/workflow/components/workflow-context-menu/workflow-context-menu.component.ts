
import { Component, inject, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ContextMenu {
  x: number;
  y: number;
  type: 'node' | 'connection' | 'canvas';
  targetId?: string;
  data?: any;
}

@Component({
  selector: 'app-workflow-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (menu(); as m) {
      <div 
         class="absolute bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[160px] animate-fadeUp origin-top-left z-[100]"
         [style.left.px]="m.x"
         [style.top.px]="m.y"
         (click)="$event.stopPropagation()">
         
         @if (m.type === 'node') {
            <button (click)="menuAction.emit({action: 'duplicate', id: m.targetId!})" class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2">Duplicate</button>
            <button (click)="menuAction.emit({action: 'breakpoint', id: m.targetId!})" class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2">Toggle Breakpoint</button>
            <div class="h-px bg-slate-100 my-1"></div>
            <button (click)="menuAction.emit({action: 'deleteNode', id: m.targetId!})" class="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2">Delete Node</button>
         }
         @if (m.type === 'connection') {
            <button (click)="menuAction.emit({action: 'deleteConnection', data: m.data})" class="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2">Delete Connection</button>
         }
         @if (m.type === 'canvas') {
            <div class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Node</div>
            @for (tool of tools; track tool.type) {
                <button (click)="menuAction.emit({action: 'addNode', type: tool.type, pos: {x: m.x, y: m.y}})" class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                    {{ tool.name }}
                </button>
            }
         }
      </div>
    }
  `,
  styles: [`
    @keyframes fadeUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-fadeUp { animation: fadeUp 0.1s ease-out forwards; }
  `]
})
export class WorkflowContextMenuComponent {
  menu = input<ContextMenu | null>();
  menuAction = output<any>();

  tools = [
    { type: 'assign', name: 'Assign' },
    { type: 'if', name: 'If / Else' },
    { type: 'action', name: 'Action' },
  ];
}
