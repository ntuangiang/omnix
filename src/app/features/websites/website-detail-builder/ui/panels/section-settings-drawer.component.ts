
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SectionSettings } from '../../domain/models/section.model';
import { ColorThemeType } from '../../domain/models/builder-document.model';

@Component({
  selector: 'app-section-settings-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
       <div class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] transition-opacity duration-300" (click)="close.emit()"></div>
       
       <div class="fixed top-1/2 right-8 -translate-y-1/2 w-[320px] h-[1000px] max-h-[95vh] bg-white rounded-xl shadow-2xl z-[101] flex flex-col overflow-hidden animate-slideIn" role="dialog">
            
            <header class="p-5 border-b border-slate-100 shrink-0 flex items-center justify-between">
                <h3 class="font-bold text-slate-900 text-lg">Section Settings</h3>
                <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </header>

            <div class="px-3 py-2 border-b border-slate-100 bg-white">
               <div class="flex bg-slate-200/70 rounded-md p-1">
                  <button (click)="activeTab.set('design')" 
                          class="flex-1 py-1.5 text-xs font-bold rounded-md transition-colors" 
                          [class.bg-white]="activeTab() === 'design'"
                          [class.text-slate-800]="activeTab() === 'design'"
                          [class.text-slate-500]="activeTab() !== 'design'">Design</button>
                  <button (click)="activeTab.set('background')" 
                          class="flex-1 py-1.5 text-xs font-bold rounded-md transition-colors" 
                          [class.bg-white]="activeTab() === 'background'"
                          [class.text-slate-800]="activeTab() === 'background'"
                          [class.text-slate-500]="activeTab() !== 'background'">Background</button>
                  <button (click)="activeTab.set('colors')" 
                          class="flex-1 py-1.5 text-xs font-bold rounded-md transition-colors"
                          [class.bg-white]="activeTab() === 'colors'"
                          [class.text-slate-800]="activeTab() === 'colors'"
                          [class.text-slate-500]="activeTab() !== 'colors'">Colors</button>
               </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
               @switch (activeTab()) {
                  @case ('design') { 
                      <div class="text-center text-sm text-slate-400 py-12">Design settings coming soon.</div> 
                  }
                  @case ('background') { 
                      <div class="flex flex-col gap-4">
                          <button (click)="openStyleBackground.emit()" class="w-full py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/></svg>
                              Open Style Background
                          </button>
                          <p class="text-xs text-center text-slate-400">Configure background colors, strokes, and more.</p>
                      </div>
                  }
                  @case ('colors') {
                     <div class="space-y-2">
                        @for (theme of colorThemes; track theme.id) {
                           <div (click)="updateTheme(theme.id)" class="flex items-center gap-4 p-2 rounded-lg cursor-pointer border-2 transition-colors" 
                                [class.border-blue-500]="settings().colorTheme === theme.id"
                                [class.bg-white]="settings().colorTheme === theme.id"
                                [class.border-transparent]="settings().colorTheme !== theme.id"
                                [class.hover:bg-slate-50]="settings().colorTheme !== theme.id">

                                <div class="w-10 h-10 rounded-md border border-slate-200 shrink-0" [style.background-color]="theme.bg"></div>
                                <div>
                                    <span class="font-bold text-sm text-slate-800">{{ theme.name }}</span>
                                </div>
                                @if (settings().colorTheme === theme.id) {
                                  <div class="ml-auto text-blue-500">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                                  </div>
                                }
                           </div>
                        }
                     </div>
                  }
               }
            </div>
       </div>
    }
  `,
  styles: [`
    .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-50%) translateX(20px); }
      to { opacity: 1; transform: translateY(-50%) translateX(0); }
    }
  `]
})
export class SectionSettingsDrawerComponent {
  isOpen = input.required<boolean>();
  settings = input.required<SectionSettings>();
  close = output<void>();
  settingsChange = output<SectionSettings>();
  openStyleBackground = output<void>();

  activeTab = signal<'design' | 'background' | 'colors'>('colors');
  colorThemes: { id: ColorThemeType, name: string, bg: string }[] = [
      { id: 'LIGHTEST_1', name: 'White', bg: '#ffffff' },
      { id: 'LIGHTEST_2', name: 'Off White', bg: '#f8fafc' },
      { id: 'LIGHT_1', name: 'Light Gray', bg: '#f1f5f9' },
      { id: 'LIGHT_2', name: 'Gray', bg: '#e2e8f0' },
      { id: 'BRIGHT_1', name: 'Bright Blue', bg: '#eff6ff' },
      { id: 'BRIGHT_2', name: 'Bright Green', bg: '#f0fdf4' },
      { id: 'DARK_1', name: 'Dark Gray', bg: '#1e293b' },
      { id: 'DARK_2', name: 'Slate', bg: '#0f172a' },
      { id: 'DARKEST_1', name: 'Charcoal', bg: '#171717' },
      { id: 'DARKEST_2', name: 'Black', bg: '#000000' }
  ];

  updateTheme(theme: ColorThemeType) {
      this.settingsChange.emit({ ...this.settings(), colorTheme: theme });
  }
}
