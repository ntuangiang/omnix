
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextEditorFacade } from '../../services/text-editor.facade';

@Component({
  selector: 'app-text-edit-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1 p-1 bg-white rounded-lg shadow-xl border border-slate-200 animate-slide-down">
        <!-- Formatting Dropdown (Simplified as buttons for now) -->
        <div class="flex bg-slate-100 rounded p-1 mr-1">
            <button (click)="facade.execCommand('formatBlock', 'P')" 
                    [class.bg-white]="facade.currentFormat() === 'p'"
                    [class.shadow-sm]="facade.currentFormat() === 'p'"
                    class="px-2 py-1 text-xs font-bold rounded hover:bg-white/50 transition-colors">
                Normal
            </button>
            <button (click)="facade.execCommand('formatBlock', 'H1')" 
                    [class.bg-white]="facade.currentFormat() === 'h1'"
                    [class.shadow-sm]="facade.currentFormat() === 'h1'"
                    class="px-2 py-1 text-xs font-bold rounded hover:bg-white/50 transition-colors">
                H1
            </button>
            <button (click)="facade.execCommand('formatBlock', 'H2')" 
                    [class.bg-white]="facade.currentFormat() === 'h2'"
                    [class.shadow-sm]="facade.currentFormat() === 'h2'"
                    class="px-2 py-1 text-xs font-bold rounded hover:bg-white/50 transition-colors">
                H2
            </button>
        </div>

        <div class="w-px h-6 bg-slate-200 mx-1"></div>

        <!-- Style Toggles -->
        <button (click)="facade.execCommand('bold')" 
                [class.bg-blue-50]="facade.isBold()" 
                [class.text-blue-600]="facade.isBold()"
                class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-700">
            <strong class="font-serif font-bold text-lg">B</strong>
        </button>

        <button (click)="facade.execCommand('italic')" 
                [class.bg-blue-50]="facade.isItalic()" 
                [class.text-blue-600]="facade.isItalic()"
                class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-700">
            <em class="font-serif italic text-lg">I</em>
        </button>

        <button (click)="facade.execCommand('underline')" 
                [class.bg-blue-50]="facade.isUnderline()" 
                [class.text-blue-600]="facade.isUnderline()"
                class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-700">
            <span class="underline text-lg font-serif">U</span>
        </button>

        <div class="w-px h-6 bg-slate-200 mx-1"></div>

        <button (click)="facade.execCommand('justifyLeft')" class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
        </button>
        
        <button (click)="facade.execCommand('justifyCenter')" class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors text-slate-500">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="19" y1="12" x2="5" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
        </button>

        <div class="w-px h-6 bg-slate-200 mx-1"></div>

        <button (click)="facade.stopEditing()" class="px-3 h-8 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
            Done
        </button>
    </div>
  `,
  styles: [`
    .animate-slide-down { animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class TextEditToolbarComponent {
  facade = inject(TextEditorFacade);
}
