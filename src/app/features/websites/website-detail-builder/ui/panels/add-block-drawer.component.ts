
import { Component, input, output, signal, computed, effect, ElementRef, viewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStore } from '../../data/website-detail-builder.store';
import { GridSnapService } from '../../dnd/grid-snap.service';
import { DEFAULT_GRID } from '../../domain/models/builder-document.model';

@Component({
  selector: 'app-add-block-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] transition-opacity duration-300"
           [class.pointer-events-none]="isDragging()"
           [class.opacity-0]="isHidingForDrag()"
           (click)="close.emit()"></div>

      <div class="fixed top-1/2 left-8 -translate-y-1/2 w-[320px] h-[500px] bg-white rounded-xl shadow-2xl z-[101] flex flex-col overflow-hidden animate-slideIn transition-all duration-300"
           [class.pointer-events-none]="isDragging()"
           [class.opacity-0]="isHidingForDrag()"
           [class.-translate-x-12]="isHidingForDrag()">
         
         <div class="p-5 border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div class="relative flex-1 mr-4">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input #searchInput [(ngModel)]="searchTerm" class="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm" placeholder="Search">
            </div>
            <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
         </div>

         <div class="flex-1 overflow-y-auto p-5 space-y-8">
            @for (cat of filteredCategories(); track cat.name) {
               <div>
                  <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 pl-1">{{ cat.name }}</h3>
                  <div class="grid grid-cols-3 gap-3">
                     @for (item of cat.items; track item.name) {
                        <div draggable="true" (dragstart)="onDragStart($event, item.type)" (dragend)="onDragEnd()" (click)="select(item)"
                             class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-slate-100 cursor-grab active:cursor-grabbing">
                           <div class="w-10 h-10 rounded bg-slate-100 text-slate-500 flex items-center justify-center">
                                @switch (item.type) {
                                    @case ('text') { <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> }
                                    @case ('image') { <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> }
                                    @case ('button') { <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="8" width="14" height="8" rx="2"/></svg> }
                                }
                           </div>
                           <span class="text-xs font-semibold text-slate-700">{{ item.name }}</span>
                        </div>
                     }
                  </div>
               </div>
            }
         </div>
      </div>
    }
  `,
   styles: [`
    .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-50%) translateX(-20px); }
      to { opacity: 1; transform: translateY(-50%) translateX(0); }
    }
  `]
})
export class AddBlockDrawerComponent {
    editorStore = inject(EditorStore);
    gridSnapService = inject(GridSnapService);
    
    isOpen = input.required<boolean>();
    close = output<void>();
    selectBlock = output<string>();
    
    searchTerm = signal('');
    isDragging = signal(false);
    isHidingForDrag = signal(false);
    searchInput = viewChild<ElementRef>('searchInput');

    categories = [{ name: 'Essentials', items: [ { name: 'Text', type: 'text' }, { name: 'Image', type: 'image' }, { name: 'Button', type: 'button' } ]}];

    filteredCategories = computed(() => {
        const term = this.searchTerm().toLowerCase();
        if (!term) return this.categories;
        return this.categories.map(cat => ({
            ...cat,
            items: cat.items.filter(item => item.name.toLowerCase().includes(term))
        })).filter(cat => cat.items.length > 0);
    });

    constructor() {
        effect(() => { 
            if (this.isOpen()) {
                this.isHidingForDrag.set(false);
                setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
            }
        });
    }

    select(item: any) { this.selectBlock.emit(item.type); }

    onDragStart(event: DragEvent, type: string) {
        this.isDragging.set(true);
        this.editorStore.isDragging.set(true);
        const defaults = this.editorStore.getBlockDefaults(type);
        
        // Calculate a default centered offset for new blocks
        const pixelW = this.gridSnapService.getPx(defaults.w, 'w', DEFAULT_GRID);
        const pixelH = this.gridSnapService.getPx(defaults.h, 'h', DEFAULT_GRID);

        this.editorStore.draggedBlockInfo.set({ 
            type, 
            w: defaults.w, 
            h: defaults.h,
            offsetX: pixelW / 2,
            offsetY: pixelH / 2
        });

        if (event.dataTransfer) {
            event.dataTransfer.setData('blockType', type);
            event.dataTransfer.effectAllowed = 'copy';
        }
        
        setTimeout(() => {
            if (this.isDragging()) {
                this.isHidingForDrag.set(true);
            }
        }, 150);
    }

    onDragEnd() {
        this.isDragging.set(false);
        this.editorStore.isDragging.set(false);
        this.editorStore.draggedBlockInfo.set(null);
        this.close.emit();
    }
}
