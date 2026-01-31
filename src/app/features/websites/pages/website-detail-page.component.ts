import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { StateService } from '../../../core/services/state.service';
// Fix: Corrected component name from PageListComponent to WebsitePagesListComponent.
import { WebsitePagesListComponent } from '../ui/website-pages-list.component';

@Component({
  selector: 'app-website-detail-page',
  standalone: true,
  // Fix: Use the correct component in imports.
  imports: [CommonModule, RouterOutlet, RouterLink, WebsitePagesListComponent],
  template: `
    <!-- This component acts as a sub-shell for a specific website -->
    <div class="flex h-full w-full bg-white overflow-hidden">
       <!-- Left Sidebar: Detailed Page Navigation -->
       <aside class="w-[340px] flex flex-col border-r border-slate-200 bg-white z-30 shrink-0 h-full">
           <div class="px-6 py-5 shrink-0">
               <a routerLink="/websites" class="flex items-center gap-1.5 text-slate-400 hover:text-slate-800 text-[10px] font-bold uppercase tracking-widest transition-colors mb-4">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"/></svg>
                  All Websites
               </a>
               <div class="flex items-center justify-between">
                   <h1 class="font-serif text-2xl font-bold text-slate-900">Pages</h1>
               </div>
           </div>
           <app-website-pages-list (pageSelect)="navigateToBuilder($event)"></app-website-pages-list>
       </aside>

       <!-- Right Panel: Will be replaced by a router-outlet for this level -->
       <main class="flex-1 bg-white relative z-10 flex flex-col h-full min-w-0">
           <!-- For now, it shows a placeholder. Ideally, a router-outlet would go here -->
           <div class="p-8">
                <h2 class="font-serif text-3xl">Website Management</h2>
                <p class="text-slate-500">Select a page to begin editing.</p>
           </div>
       </main>
    </div>
  `,
})
export class WebsiteDetailPageComponent {
  // Fix: Explicitly type injected Router to fix type inference.
  router: Router = inject(Router);

  navigateToBuilder(pageId: string) {
    // This would navigate to a nested route like /websites/:id/builder/:pageId
    // For now, it uses the top-level builder route.
    this.router.navigate(['/builder', pageId]);
  }
}