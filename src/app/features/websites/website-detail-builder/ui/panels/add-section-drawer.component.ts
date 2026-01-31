
import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../../../core/ai/ai.service';
import { StateService } from '../../../../../core/services/state.service';

@Component({
  selector: 'app-add-section-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="close.emit()">
         <div class="bg-white w-[800px] h-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 class="font-serif text-2xl font-bold">Add Section</h3>
                <button (click)="close.emit()" class="text-slate-400 hover:text-slate-900"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div class="flex-1 overflow-y-auto p-8 bg-white grid grid-cols-2 gap-6">
                @for (tool of tools; track tool.type) {
                    <div class="bg-slate-50 p-6 rounded-lg border border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-lg cursor-pointer transition-all group" (click)="select.emit(tool.type)">
                        <div class="h-32 bg-white mb-4 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 group-hover:border-slate-300 transition-colors"><div [innerHTML]="tool.icon" class="scale-150"></div></div>
                        <h4 class="font-bold text-slate-900">{{ tool.name }}</h4>
                    </div>
                }
            </div>
            <div class="p-4 border-t border-slate-100 bg-white flex gap-2">
               <div class="flex items-center gap-2 px-3 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase">AI</div>
               <input [(ngModel)]="prompt" (keydown.enter)="generateUi()" placeholder="Describe a section to generate..." class="flex-1 text-sm outline-none">
               <button (click)="generateUi()" class="text-blue-600 font-bold text-sm hover:bg-blue-50 rounded-md h-9 px-4 flex items-center transition-colors" [disabled]="isGenerating()">
                   {{ isGenerating() ? 'Generating...' : 'Generate' }}
               </button>
            </div>
         </div>
      </div>
    }
  `
})
export class AddSectionDrawerComponent {
  state = inject(StateService);
  ai = inject(AiService);

  isOpen = input.required<boolean>();
  close = output<void>();
  select = output<string>();
  
  prompt = '';
  isGenerating = signal(false);

  tools = [
    { type: 'hero', name: 'Hero', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' },
    { type: 'content', name: 'Content Split', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>' },
    { type: 'features', name: 'Features Grid', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    { type: 'cta', name: 'Call to Action', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="8" rx="2"/></svg>' },
  ];

  async generateUi() {
      if (!this.prompt.trim()) return;
      this.isGenerating.set(true);
      try {
        const result = await this.ai.generateUiStructure(this.prompt);
        if (result && result.components && result.components.length > 0) {
           this.select.emit(result.components[0].type); 
        }
      } finally {
        this.isGenerating.set(false);
      }
  }
}
