
import { Injectable } from '@angular/core';

export interface OverlayPosition {
  top: number;
  left: number;
}

export interface PositionTarget {
  getBoundingClientRect(): {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OverlayPositionService {

  calculatePosition(target: PositionTarget, overlayWidth: number, overlayHeight: number, gap: number = 8): OverlayPosition {
    const rect = target.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default: Position to the right
    let left = rect.right + gap;
    let top = rect.top;

    // Check right edge
    if (left + overlayWidth > viewportWidth) {
      // Try left side
      if (rect.left - overlayWidth - gap > 0) {
        left = rect.left - overlayWidth - gap;
      } else {
        // Stick to right edge if it doesn't fit anywhere
        left = viewportWidth - overlayWidth - gap;
      }
    }

    // Check bottom edge
    if (top + overlayHeight > viewportHeight) {
      top = viewportHeight - overlayHeight - gap;
    }

    // Check top edge
    if (top < gap) {
      top = gap;
    }

    return { top, left };
  }
}
