
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BlockContextMenu {
  x: number;
  y: number;
  blockId: string;
  sectionId: string;
}

@Component({
  selector: 'app-block-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (menu(); as m) {
      <div 
         class="absolute bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[180px] animate-fadeUp origin-top-left z-[100]"
         [style.left.px]="m.x"
         [style.top.px]="m.y"
         (click)="$event.stopPropagation()"
         (mousedown)="$event.stopPropagation()"
         (contextmenu)="$event.preventDefault(); $event.stopPropagation()">
         
         <button (click)="menuAction.emit({action: 'duplicate', blockId: m.blockId, sectionId: m.sectionId})" class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-3">
            Duplicate
         </button>
         <button (click)="menuAction.emit({action: 'properties', blockId: m.blockId, sectionId: m.sectionId})" class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-3">
            Properties
         </button>
         <div class="h-px bg-slate-100 my-1"></div>
         <button (click)="menuAction.emit({action: 'bringForward', blockId: m.blockId, sectionId: m.sectionId})" class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-3">
            Bring Forward
         </button>
         <button (click)="menuAction.emit({action: 'sendBackward', blockId: m.blockId, sectionId: m.sectionId})" class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-3">
            Send Backward
         </button>
         <div class="h-px bg-slate-100 my-1"></div>
         <button (click)="menuAction.emit({action: 'delete', blockId: m.blockId, sectionId: m.sectionId})" class="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-3">
            Delete
         </button>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-fadeUp { animation: fadeUp 0.1s ease-out forwards; }
  `]
})
export class BlockContextMenuComponent {
  menu = input<BlockContextMenu | null>();
  menuAction = output<{ action: string; blockId: string; sectionId: string; }>();
}
