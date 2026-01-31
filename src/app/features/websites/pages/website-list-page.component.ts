import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../../core/services/state.service'; // Temporary
import { WebsiteCardComponent } from '../ui/website-card.component';

@Component({
  selector: 'app-website-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, WebsiteCardComponent],
  template: `
    <main class="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
      <header class="flex items-center justify-between mb-12">
          <h1 class="font-serif text-4xl font-bold text-slate-900">Websites</h1>
          <button class="bg-slate-900 text-white px-8 h-9 flex items-center rounded-md text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-sm">
              Create Website
          </button>
      </header>
      <div class="space-y-6">
         @for (site of state.websites(); track site.id) {
             <a [routerLink]="['/websites', site.id]">
                <app-website-card [website]="site"></app-website-card>
             </a>
         }
      </div>
    </main>
  `
})
export class WebsiteListPageComponent {
  state = inject(StateService); // Temporary
}
