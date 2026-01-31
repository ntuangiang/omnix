
import { Component, input, output, effect, ElementRef, viewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block } from '../../domain/models/block.model';
import { TextEditorFacade } from '../../services/text-editor.facade';

@Component({
  selector: 'app-text-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div #editor
         class="w-full h-full outline-none p-1 transition-all min-h-[1em] prose-sm max-w-none"
         [class.cursor-text]="isEditing()"
         [class.cursor-default]="!isEditing()"
         [contentEditable]="isEditing()"
         (input)="onContentChange($event)"
         (mouseup)="onInteraction()"
         (keyup)="onInteraction()"
         (keydown.enter)="$event.stopPropagation()"
         (keydown.escape)="onEscape()">
    </div>
  `,
  styles: [`
    [contenteditable]:empty:before { 
      content: 'Start typing...'; 
      color: #94a3b8; 
      font-style: italic; 
      pointer-events: none;
    }
    [contenteditable]:focus { 
      outline: none; 
    }
    :host h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.2; }
    :host h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; line-height: 1.3; }
    :host p { margin-bottom: 0.5rem; }
    :host ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
    ::selection { background-color: rgba(59, 130, 246, 0.2); }
  `]
})
export class TextBlockComponent implements OnDestroy {
  block = input.required<Block>();
  isEditing = input.required<boolean>();
  
  contentChange = output<string>();
  stopEdit = output<void>();

  editor = viewChild<ElementRef>('editor');
  facade = inject(TextEditorFacade);

  constructor() {
     // Sync Content
     effect(() => {
        const editorEl = this.editor()?.nativeElement;
        if (editorEl) {
           const content = this.block().content || '';
           if (typeof content === 'string' && editorEl.innerHTML !== content) {
               editorEl.innerHTML = content;
           }
        }
     });

     // Sync Edit Mode with Facade
     effect(() => {
        if (this.isEditing() && this.editor()) {
            const el = this.editor()!.nativeElement;
            
            // Notify Facade to show global toolbar
            this.facade.startEditing(this.block().id, el);
            
            // Focus management
            setTimeout(() => {
                el.focus();
                // Select all if newly entered
                const selection = window.getSelection();
                if (selection && selection.rangeCount === 0) {
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }, 0);
        } else {
             // Stop Editing (if this block was the active one)
             if (this.facade.activeBlockId() === this.block().id) {
                 this.facade.stopEditing();
             }
        }
     });
  }

  ngOnDestroy() {
      // Cleanup if removed while editing
      if (this.facade.activeBlockId() === this.block().id) {
          this.facade.stopEditing();
      }
  }

  onInteraction() {
    if (!this.isEditing()) return;
    this.facade.checkSelection();
  }

  onEscape() { this.stopEdit.emit(); }
  
  onContentChange(e: Event) { 
      const target = e.target as HTMLElement;
      this.contentChange.emit(target.innerHTML); 
  }
}
