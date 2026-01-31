
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StateService } from '../services/state.service'; // For legacy data access

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      <!-- Global Sidebar -->
      <aside class="w-72 border-r border-slate-100 bg-white flex flex-col z-50 shadow-[2px_0_20px_rgba(0,0,0,0.01)] relative h-full shrink-0">
        <div class="h-16 flex items-center px-8 shrink-0">
          <a routerLink="/dashboard" class="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-[10px] font-bold uppercase tracking-widest transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back to Dashboard
          </a>
        </div>
        <div class="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar px-2">
          @for (item of menuItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" class="flex items-center gap-3 px-6 py-2.5 cursor-pointer hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors rounded-lg">
              <span class="text-sm">{{ item.label }}</span>
            </a>
          }
        </div>
        <div class="absolute bottom-0 w-full p-6 border-t border-slate-100 bg-white">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold font-serif">N</div>
            <div>
              <span class="text-xs font-bold text-slate-900">Admin User</span>
              <span class="text-[10px] text-slate-400">Owner</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-hidden relative bg-white h-full">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .active {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 500;
    }
  `]
})
export class AppShellComponent {
  // Using StateService for now to simulate data access. This would be replaced by facades.
  state = inject(StateService); 

  menuItems = [
    { path: '/websites', label: 'Websites' },
    { path: '/workflows', label: 'Workflows' },
    { path: '/deploy', label: 'Deploy' },
    { path: '/marketing', label: 'Marketing' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/settings', label: 'Settings' },
  ];
}
