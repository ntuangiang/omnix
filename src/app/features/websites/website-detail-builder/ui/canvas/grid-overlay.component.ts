
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridConfig } from '../../domain/models/builder-document.model';

@Component({
  selector: 'app-grid-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 z-0 pointer-events-none transition-opacity duration-200"
         [class.opacity-100]="isVisible()"
         [class.opacity-0]="!isVisible()">
        
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
           <defs>
               <pattern [id]="patternId()" 
                        [attr.x]="config().paddingX" 
                        [attr.y]="config().paddingY" 
                        [attr.width]="config().cellW + config().gap" 
                        [attr.height]="config().cellH + config().gap" 
                        patternUnits="userSpaceOnUse">
                   <rect [attr.width]="config().cellW" 
                         [attr.height]="config().cellH" 
                         rx="4" 
                         fill="#cbd5e1" 
                         fill-opacity="0.5" />
               </pattern>
           </defs>
           <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4 4" opacity="0.5" />
           <rect x="0" y="0" width="100%" height="100%" [attr.fill]="'url(#' + patternId() + ')'" />
        </svg>
    </div>
  `
})
export class GridOverlayComponent {
  config = input.required<GridConfig>();
  isVisible = input.required<boolean>();
  sectionId = input.required<string>();

  patternId = computed(() => `grid-pattern-${this.sectionId()}`);
}
