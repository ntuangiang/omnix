
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextEditorFacade {
  // The ID of the block currently being edited
  readonly activeBlockId = signal<string | null>(null);
  
  // The contenteditable element reference
  private activeElement: HTMLElement | null = null;

  // Formatting State Signals
  readonly isBold = signal(false);
  readonly isItalic = signal(false);
  readonly isUnderline = signal(false);
  readonly isStrikeThrough = signal(false);
  readonly currentFormat = signal('p'); // p, h1, h2, h3

  startEditing(blockId: string, element: HTMLElement) {
    this.activeBlockId.set(blockId);
    this.activeElement = element;
    this.checkSelection();
  }

  stopEditing() {
    this.activeBlockId.set(null);
    this.activeElement = null;
  }

  /**
   * Updates the state signals based on the current selection in the active element.
   * Should be called on mouseup, keyup, etc.
   */
  checkSelection() {
    if (!this.activeElement) return;
    
    // We use document.queryCommandState for compatibility with contentEditable
    this.isBold.set(document.queryCommandState('bold'));
    this.isItalic.set(document.queryCommandState('italic'));
    this.isUnderline.set(document.queryCommandState('underline'));
    this.isStrikeThrough.set(document.queryCommandState('strikethrough'));
    
    const formatBlock = document.queryCommandValue('formatBlock');
    this.currentFormat.set(formatBlock ? formatBlock.toLowerCase() : 'p');
  }

  execCommand(command: string, value: string = '') {
      if (!this.activeElement) return;
      document.execCommand(command, false, value);
      this.activeElement.focus();
      this.checkSelection();
  }
}
