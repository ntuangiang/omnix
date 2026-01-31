
import { Component, input, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block } from '../../domain/models/block.model';

interface LayoutPreset {
  name: string;
  description: string;
  blocks: Partial<Block>[];
}

@Component({
  selector: 'app-layouts-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-fade-in" 
        (click)="close.emit()">
         
         <div 
            class="bg-white border border-slate-200 w-[90vw] max-w-[1000px] h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up" 
            (click)="$event.stopPropagation()">
            
            <header class="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                <h3 class="font-serif text-2xl font-bold text-slate-900">Layouts</h3>
                <button (click)="close.emit()" class="text-slate-400 hover:text-slate-800 transition-colors">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </header>

            <main class="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 custom-scrollbar bg-slate-50/50">
                @for (layout of layouts; track layout.name) {
                    <div (click)="applyLayout.emit(layout.blocks)" 
                         class="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all group">
                        
                        <div class="aspect-[4/3] bg-slate-100 rounded-md mb-4 p-2 grid grid-cols-12 gap-1 border border-slate-200">
                            @for (block of layout.blocks; track $index) {
                                <div class="bg-slate-300 rounded-sm"
                                     [style.grid-column-start]="(block.x || 0) + 1"
                                     [style.grid-column-end]="(block.x || 0) + (block.w || 1) + 1"
                                     [style.grid-row-start]="(block.y || 0) + 1"
                                     [style.grid-row-end]="(block.y || 0) + (block.h || 1) + 1">
                                </div>
                            }
                        </div>
                        <h4 class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{{ layout.name }}</h4>
                        <p class="text-xs text-slate-500">{{ layout.description }}</p>
                    </div>
                }
            </main>
         </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
  `]
})
export class LayoutsDrawerComponent {
  isOpen = input.required<boolean>();
  close = output<void>();
  applyLayout = output<Partial<Block>[]>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  layouts: LayoutPreset[] = [
    {
      name: 'Hero Banner',
      description: 'A large, centered headline and button, perfect for introductions.',
      blocks: [
        { type: 'text', x: 3, y: 4, w: 6, h: 2, content: { html: '<h1>Hero Title</h1>' } },
        { type: 'button', x: 4, y: 7, w: 4, h: 1, content: { label: 'Get Started' } }
      ]
    },
    {
      name: 'Split: Image Left',
      description: 'A classic two-column layout with a large image and supporting text.',
      blocks: [
        { type: 'image', x: 0, y: 1, w: 5, h: 8 },
        { type: 'text', x: 6, y: 3, w: 6, h: 4, content: { html: '<h2>Headline</h2><p>Supporting text...</p>' } }
      ]
    },
    {
      name: 'Split: Image Right',
      description: 'A two-column layout with text on the left and a prominent image.',
      blocks: [
        { type: 'text', x: 0, y: 3, w: 6, h: 4, content: { html: '<h2>Headline</h2><p>Supporting text...</p>' } },
        { type: 'image', x: 7, y: 1, w: 5, h: 8 }
      ]
    },
    {
      name: 'Three-Column Grid',
      description: 'Showcase three key features or items side-by-side.',
      blocks: [
        { type: 'image', x: 0, y: 1, w: 3, h: 3 },
        { type: 'text', x: 0, y: 5, w: 3, h: 2 },
        { type: 'image', x: 4, y: 1, w: 3, h: 3 },
        { type: 'text', x: 4, y: 5, w: 3, h: 2 },
        { type: 'image', x: 8, y: 1, w: 3, h: 3 },
        { type: 'text', x: 8, y: 5, w: 3, h: 2 }
      ]
    },
     {
      name: 'Image Collage',
      description: 'An artistic arrangement of overlapping images.',
      blocks: [
        { type: 'image', x: 0, y: 1, w: 5, h: 5 },
        { type: 'image', x: 6, y: 3, w: 6, h: 6 },
        { type: 'image', x: 4, y: 0, w: 4, h: 3 },
      ]
    },
    {
      name: 'Centered Content',
      description: 'A focused column of text, ideal for articles or mission statements.',
      blocks: [
        { type: 'text', x: 2, y: 2, w: 8, h: 6, content: { html: '<h2>Focused Content</h2><p>...</p>' } },
      ]
    }
  ];
}
