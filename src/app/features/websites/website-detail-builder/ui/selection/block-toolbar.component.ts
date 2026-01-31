
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-block-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute -inset-[2px] z-50 pointer-events-none overflow-visible">
        
        <!-- Block Mode Frame (Blue Border) -->
        <div class="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 transition-colors z-40"></div>
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-colors z-40"></div>
        <div class="absolute top-0 bottom-0 left-0 w-0.5 bg-blue-600 transition-colors z-40"></div>
        <div class="absolute top-0 bottom-0 right-0 w-0.5 bg-blue-600 transition-colors z-40"></div>

        <!-- Resize Handles (Visible in Block Mode OR Edit Mode if requested) -->
        <!-- Corner Handles -->
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -top-3 -left-3 cursor-nwse-resize" (mousedown)="onResizeStart($event, 'nw')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -top-3 -right-3 cursor-nesw-resize" (mousedown)="onResizeStart($event, 'ne')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -bottom-3 -left-3 cursor-nesw-resize" (mousedown)="onResizeStart($event, 'sw')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -bottom-3 -right-3 cursor-nwse-resize" (mousedown)="onResizeStart($event, 'se')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        
        <!-- Midpoint Handles -->
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -top-3 left-1/2 -translate-x-1/2 cursor-ns-resize" (mousedown)="onResizeStart($event, 'n')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -bottom-3 left-1/2 -translate-x-1/2 cursor-ns-resize" (mousedown)="onResizeStart($event, 's')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -left-3 top-1/2 -translate-y-1/2 cursor-ew-resize" (mousedown)="onResizeStart($event, 'w')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>
        <div class="absolute w-6 h-6 flex items-center justify-center pointer-events-auto z-[60] group -right-3 top-1/2 -translate-y-1/2 cursor-ew-resize" (mousedown)="onResizeStart($event, 'e')">
            <div class="w-2.5 h-2.5 bg-white border-2 border-blue-600 shadow-sm transition-transform group-hover:scale-125"></div>
        </div>

        <!-- Block Identity Pill (Hide in Edit Mode to clear space for text toolbar) -->
        @if (!isEditing()) {
            <div class="absolute -top-8 left-0 pointer-events-auto z-50 flex items-center gap-1">
                 <div class="flex items-center gap-2 bg-blue-600 text-white px-2 py-1 rounded-md shadow-sm animate-pillIn origin-bottom-left border border-white/10">
                    <span class="text-[10px] font-bold uppercase tracking-wider leading-none">{{ blockType() }}</span>
                 </div>
            </div>
        }

        <!-- Quick Actions Toolbar (Only when NOT editing) -->
        @if (!isEditing()) {
            <div class="absolute -top-10 right-0 pointer-events-auto z-50 animate-toolbarIn origin-bottom-right">
                <div class="flex items-center bg-white rounded-md shadow-lg border border-slate-200 p-1 gap-1">
                    @if (blockType() === 'text') {
                        <button (click)="editModeToggle.emit()" class="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit Text (Double Click)">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <div class="w-px h-4 bg-slate-200"></div>
                    }
                    
                    <button (click)="command.emit('open-style-background')" class="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" title="Background Style">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </button>
                    
                    <button (click)="command.emit('show-properties')" class="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" title="Properties">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </button>
                    
                    <button (click)="command.emit('duplicate')" class="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" title="Duplicate">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    
                    <div class="w-px h-4 bg-slate-200"></div>

                    <button (click)="delete.emit($event)" class="w-7 h-7 rounded flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        }
    </div>
  `,
  styles: [`
    @keyframes toolbarIn { 
      from { opacity: 0; transform: translateY(5px) scale(0.95); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }
    @keyframes pillIn { 
      from { opacity: 0; transform: scale(0.8); } 
      to { opacity: 1; transform: scale(1); } 
    }
    .animate-toolbarIn { animation: toolbarIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-pillIn { animation: pillIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class BlockToolbarComponent {
  blockType = input<string>('TEXT');
  isEditing = input<boolean>(false);

  command = output<string>();
  delete = output<MouseEvent>();
  editModeToggle = output<void>();
  resizeStart = output<{ event: MouseEvent, direction: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' }>();

  onResizeStart(event: MouseEvent, direction: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w') {
    event.stopPropagation();
    event.preventDefault();
    this.resizeStart.emit({ event, direction });
  }
}
