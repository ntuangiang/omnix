import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../../../../core/services/state.service';

@Component({
  selector: 'app-website-builder-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-[60]">
       <div class="flex items-center gap-4 w-1/4">
          <button (click)="state.saveState()" class="bg-slate-900 text-white px-6 h-9 flex items-center rounded-md text-[11px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors">Save</button>
          <button (click)="exit()" class="text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-4 h-9 flex items-center rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors">Exit</button>
          <div class="w-px h-4 bg-slate-200 mx-2"></div>
          <div class="flex items-center gap-2">
              <button (click)="state.undo()" [disabled]="!state.canUndo()" class="text-slate-400 hover:text-slate-900 disabled:opacity-30"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>
              <button (click)="state.redo()" [disabled]="!state.canRedo()" class="text-slate-400 hover:text-slate-900 disabled:opacity-30"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg></button>
          </div>
       </div>
       <div class="flex flex-col items-center justify-center w-2/4">
          <h1 class="font-sans font-bold text-xs text-slate-900 tracking-[0.1em] uppercase mb-0.5">{{ activePageTitle() }}</h1>
          <div class="text-[10px] text-slate-400 font-medium tracking-wide">Page · {{ activePageStatus() | titlecase }}</div>
       </div>
       <div class="flex items-center justify-end gap-5 w-1/4">
           <div class="flex gap-4 items-center">
              <button (click)="state.viewMode.set('desktop')" [class.text-slate-900]="state.viewMode() === 'desktop'" [class.text-slate-300]="state.viewMode() !== 'desktop'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></button>
              <button (click)="state.viewMode.set('mobile')" [class.text-slate-900]="state.viewMode() === 'mobile'" [class.text-slate-300]="state.viewMode() !== 'mobile'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></button>
           </div>
       </div>
    </header>
  `
})
export class WebsiteBuilderTopbarComponent {
  state = inject(StateService);
  // Fix: Explicitly type the injected `Router` to ensure `navigate` method is available.
  router: Router = inject(Router);

  activePageTitle = computed(() => this.state.activePage()?.title || 'Unknown');
  activePageStatus = computed(() => this.state.activePage()?.status || 'Draft');

  exit() {
     // This would ideally navigate to the specific website's detail page
     this.router.navigate(['/websites']);
  }
}
