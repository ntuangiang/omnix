
import { Directive, ElementRef, inject, output, input, OnDestroy, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {
  clickOutside = output<MouseEvent | TouchEvent>();
  ignore = input<HTMLElement[]>([]);
  
  private elementRef = inject(ElementRef);
  private document = inject<Document>(DOCUMENT);

  private onEvent = (event: MouseEvent | TouchEvent) => {
    const target = event.target as Node;
    if (!target) return;

    const isInside = this.elementRef.nativeElement.contains(target);
    const isIgnored = this.ignore().some(el => el && el.contains(target));

    if (!isInside && !isIgnored) {
      this.clickOutside.emit(event);
    }
  };

  ngAfterViewInit() {
    // Use bubble phase (false) to respect stopPropagation from children
    this.document.addEventListener('mousedown', this.onEvent, false);
    this.document.addEventListener('contextmenu', this.onEvent, false);
    this.document.addEventListener('touchstart', this.onEvent, false);
  }

  ngOnDestroy() {
    this.document.removeEventListener('mousedown', this.onEvent, false);
    this.document.removeEventListener('contextmenu', this.onEvent, false);
    this.document.removeEventListener('touchstart', this.onEvent, false);
  }
}
