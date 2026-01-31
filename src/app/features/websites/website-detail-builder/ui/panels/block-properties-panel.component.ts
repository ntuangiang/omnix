
import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Block } from '../../domain/models/block.model';
import { StateService } from '../../../../../core/services/state.service';

@Component({
  selector: 'app-block-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (block(); as b) {
       <div class="absolute z-[101] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col transition-all duration-300 ease-out animate-panelPop"
            [style.width.px]="320"
            [style.height.px]="500"
            [style.left.px]="position()?.x || 0"
            [style.top.px]="position()?.y || 0"
            (click)="$event.stopPropagation()">

            <!-- Header -->
            <div class="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
               <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    @switch (b.type) {
                      @case('text') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> }
                      @case('button') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="8" width="14" height="8" rx="2"/></svg> }
                      @case('image') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> }
                    }
                  </div>
                  <h3 class="font-bold text-slate-900 text-sm tracking-tight">{{ b.type | titlecase }}</h3>
               </div>
               <button (click)="close.emit()" class="text-slate-300 hover:text-slate-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
               </button>
            </div>

            <!-- Tabs (Optional placeholder for future extensibility) -->
            <div class="px-6 py-2 border-b border-slate-50 flex gap-4">
               <button class="text-[11px] font-bold text-blue-600 border-b-2 border-blue-600 pb-1">Content</button>
               <button class="text-[11px] font-bold text-slate-400 hover:text-slate-600 pb-1 transition-colors">Style</button>
            </div>

            <!-- Properties Form -->
            <div class="flex-1 overflow-y-auto p-6 bg-white space-y-6 custom-scrollbar">
                @switch (b.type) {
                    @case('text') {
                        <div class="bg-blue-50/50 text-blue-800 text-xs font-medium p-4 rounded-xl leading-relaxed border border-blue-100">
                            Text content is edited directly on the canvas. Double-click the block to start editing.
                        </div>
                        <div class="space-y-4 pt-2">
                           <div>
                              <label class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Visibility</label>
                              <div class="flex items-center gap-2 mt-2">
                                 <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked>
                                 <span class="text-xs text-slate-600">Visible on this page</span>
                              </div>
                           </div>
                        </div>
                    }
                    @case('button') {
                        <div class="space-y-5">
                            <div>
                                <label class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Label</label>
                                <input type="text" [ngModel]="b.content.label" (ngModelChange)="updateField('label', $event)" class="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300" placeholder="Enter button text">
                            </div>
                            
                            <div>
                                <label class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Action Type</label>
                                <div class="flex bg-slate-100 p-0.5 rounded-lg mb-3">
                                     <button (click)="updateField('actionType', 'url')" 
                                             class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" 
                                             [class.bg-white]="b.content.actionType !== 'workflow'"
                                             [class.shadow-sm]="b.content.actionType !== 'workflow'"
                                             [class.text-slate-500]="b.content.actionType === 'workflow'"
                                             [class.text-slate-900]="b.content.actionType !== 'workflow'">
                                         Open URL
                                     </button>
                                     <button (click)="updateField('actionType', 'workflow')" 
                                             class="flex-1 py-1.5 text-xs font-bold rounded-md transition-all" 
                                             [class.bg-white]="b.content.actionType === 'workflow'"
                                             [class.shadow-sm]="b.content.actionType === 'workflow'"
                                             [class.text-slate-500]="b.content.actionType !== 'workflow'"
                                             [class.text-slate-900]="b.content.actionType === 'workflow'">
                                         Run Workflow
                                     </button>
                                </div>

                                @if (b.content.actionType === 'workflow') {
                                    <div class="space-y-2 animate-fade-in">
                                         <select [ngModel]="b.content.workflowId" (ngModelChange)="updateField('workflowId', $event)" 
                                                 class="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none">
                                             <option [value]="null">Select a flow...</option>
                                             @for (wf of state.workflows(); track wf.id) {
                                                 <option [value]="wf.id">{{ wf.name }}</option>
                                             }
                                         </select>
                                         @if (b.content.workflowId) {
                                            <button (click)="navigateToWorkflow(b.content.workflowId)" class="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                                <span>Edit Logic Flow</span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                            </button>
                                         }
                                    </div>
                                } @else {
                                    <div class="animate-fade-in">
                                        <input type="text" [ngModel]="b.content.href" (ngModelChange)="updateField('href', $event)" class="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300" placeholder="https://...">
                                    </div>
                                }
                            </div>

                            <div>
                                <label class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Theme</label>
                                <div class="grid grid-cols-2 gap-2 mt-2">
                                    <button (click)="updateField('style', 'primary')" 
                                            class="py-2 text-[11px] font-bold rounded-lg border-2 transition-all"
                                            [class.bg-slate-900]="b.content.style === 'primary'"
                                            [class.text-white]="b.content.style === 'primary'"
                                            [class.border-slate-900]="b.content.style === 'primary'"
                                            [class.bg-white]="b.content.style !== 'primary'"
                                            [class.text-slate-600]="b.content.style !== 'primary'"
                                            [class.border-slate-100]="b.content.style !== 'primary'"
                                            [class.hover:border-slate-200]="b.content.style !== 'primary'">
                                        Primary
                                    </button>
                                    <button (click)="updateField('style', 'secondary')" 
                                            class="py-2 text-[11px] font-bold rounded-lg border-2 transition-all"
                                            [class.bg-slate-900]="b.content.style === 'secondary'"
                                            [class.text-white]="b.content.style === 'secondary'"
                                            [class.border-slate-900]="b.content.style === 'secondary'"
                                            [class.bg-white]="b.content.style !== 'secondary'"
                                            [class.text-slate-600]="b.content.style !== 'secondary'"
                                            [class.border-slate-100]="b.content.style !== 'secondary'"
                                            [class.hover:border-slate-200]="b.content.style !== 'secondary'">
                                        Secondary
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                    @case('image') {
                        <div class="space-y-5">
                            <div>
                                <label class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Image URL</label>
                                <div class="flex gap-2">
                                   <input type="text" [ngModel]="b.content.src" (ngModelChange)="updateField('src', $event)" placeholder="https://..." class="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300">
                                   <button class="shrink-0 w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                   </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Alt Text</label>
                                <textarea [ngModel]="b.content.alt" (ngModelChange)="updateField('alt', $event)" placeholder="Descriptive text for accessibility" class="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 h-20 resize-none py-2"></textarea>
                            </div>
                        </div>
                    }
                    @default {
                       <div class="text-center py-12 text-slate-400">
                          <p class="text-xs">No unique properties for this block type.</p>
                       </div>
                    }
                }
            </div>

            <!-- Footer (Optional) -->
            <div class="p-4 border-t border-slate-50 flex items-center justify-center bg-slate-50/30">
               <span class="text-[10px] text-slate-400 font-medium uppercase tracking-widest italic">Nexus Design Engine</span>
            </div>
       </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

    @keyframes panelPop {
      from { opacity: 0; transform: scale(0.96) translateY(5px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-panelPop {
      animation: panelPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class BlockPropertiesPanelComponent {
  state = inject(StateService);
  router = inject(Router);

  block = input<Block | null | undefined>();
  position = input<{ x: number; y: number } | null>();
  close = output<void>();
  contentUpdate = output<Partial<any>>();

  updateField(field: string, value: any) {
    this.contentUpdate.emit({ [field]: value });
  }

  navigateToWorkflow(id: string) {
    this.state.activeWorkflowId.set(id);
    this.router.navigate(['/workflows']);
  }
}
