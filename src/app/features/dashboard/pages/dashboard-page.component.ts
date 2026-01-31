import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../../core/services/state.service'; // Temporary
import { WebsiteCardComponent } from '../../websites/ui/website-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, WebsiteCardComponent],
  template: `
    <div class="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
       
       <nav class="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white sticky top-0 z-50">
          <div class="flex items-center gap-8">
             <div class="flex items-center gap-2">
                 <div class="w-8 h-8 bg-slate-900 rounded-full text-white flex items-center justify-center font-serif font-bold text-lg">N</div>
             </div>
             <div class="flex gap-6 text-sm font-medium">
                 <a href="#" class="text-slate-900 border-b-2 border-slate-900 pb-5 pt-5">Dashboard</a>
                 <a href="#" class="text-slate-500 hover:text-slate-900 transition-colors">Domains</a>
             </div>
          </div>
          <div class="flex items-center gap-6">
              <a href="#" class="text-sm font-medium text-slate-500 hover:text-slate-900">Help</a>
              <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-serif font-bold cursor-pointer hover:bg-slate-200">
                  N
              </div>
          </div>
       </nav>

       <main class="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
          
          <header class="flex items-center justify-between mb-12">
              <h1 class="font-serif text-4xl font-bold text-slate-900">Dashboard</h1>
              <button class="bg-slate-900 text-white px-8 h-9 flex items-center rounded-md text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-sm">
                  Create Website
              </button>
          </header>

          <div class="space-y-6">
             @for (site of state.websites(); track site.id) {
                 <div class="cursor-pointer" (click)="openWebsite(site.id)">
                   <app-website-card [website]="site" [showStatus]="true"></app-website-card>
                 </div>
             }
          </div>
       </main>
    </div>
  `
})
export class DashboardPageComponent {
  state = inject(StateService); // Temporary, should use a facade
  // Fix: Explicitly type `router` to resolve `navigate` method.
  router: Router = inject(Router);

  openWebsite(id: string) {
      this.router.navigate(['/websites', id]);
  }
}
