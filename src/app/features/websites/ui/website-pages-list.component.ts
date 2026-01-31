
import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../core/services/state.service';

@Component({
  selector: 'app-website-pages-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 overflow-y-auto custom-scrollbar px-6 pb-12 space-y-8">
      @for (group of state.pages(); track group.category) {
        <div class="space-y-3">
          <div class="flex items-center justify-between group cursor-pointer" (click)="state.toggleGroup(group.category)">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ group.category }}</h3>
          </div>
          @if (group.expanded) {
            <div class="space-y-1">
              @for (item of group.items; track item.id) {
                <div 
                  (click)="pageSelect.emit(item.id)"
                  class="flex items-center justify-between py-2 px-2 -mx-2 rounded cursor-pointer transition-colors group/item"
                  [class.bg-slate-100]="state.activePageId() === item.id"
                  [class.hover:bg-slate-50]="state.activePageId() !== item.id"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-slate-700 font-medium truncate max-w-[150px]">{{ item.title }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
    <div class="p-6 border-t border-slate-100 bg-white">
      <button class="w-full h-9 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:border-slate-400 hover:text-slate-900 transition-colors">
        + Add Page
      </button>
    </div>
  `
})
export class WebsitePagesListComponent {
  state = inject(StateService); // Temporary
  pageSelect = output<string>();
}
