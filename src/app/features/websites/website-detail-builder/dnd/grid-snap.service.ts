
import { Injectable } from '@angular/core';
import { GridConfig } from '../domain/models/builder-document.model';

@Injectable({ providedIn: 'root' })
export class GridSnapService {
  
  getPx(units: number, dim: 'x' | 'y' | 'w' | 'h', config: GridConfig): number {
    if (dim === 'x') return config.paddingX + (units * (config.cellW + config.gap));
    if (dim === 'y') return config.paddingY + (units * (config.cellH + config.gap));
    if (dim === 'w') return Math.max(0, (units * config.cellW) + (Math.max(0, units - 1) * config.gap));
    if (dim === 'h') return Math.max(0, (units * config.cellH) + (Math.max(0, units - 1) * config.gap));
    return 0;
  }

  getGridPosition(clientX: number, clientY: number, rect: DOMRect, config: GridConfig, offsetX: number, offsetY: number): { x: number, y: number } {
    // The top-left of the block relative to the section is the mouse position minus the grab offset
    const relativeX = clientX - rect.left - offsetX;
    const relativeY = clientY - rect.top - offsetY;

    const colWidth = config.cellW + config.gap;
    const rowHeight = config.cellH + config.gap;
    
    // Subtract padding before calculating units
    const gridRelX = relativeX - config.paddingX;
    const gridRelY = relativeY - config.paddingY;
    
    const gridX = Math.round(gridRelX / colWidth);
    const gridY = Math.round(gridRelY / rowHeight);
    
    return { x: gridX, y: gridY };
  }

  clampToBoundaries(x: number, y: number, w: number, h: number, containerWidth: number, rowCount: number, config: GridConfig): { x: number, y: number } {
     const colWidth = config.cellW + config.gap;
     const maxCols = Math.floor((containerWidth - (config.paddingX * 2) + config.gap) / colWidth);
     let finalX = Math.max(0, x);
     if (finalX + w > maxCols) {
         finalX = Math.max(0, maxCols - w);
     }
     
     const maxRows = rowCount;
     let finalY = Math.max(0, y);
     if (finalY + h > maxRows) {
        finalY = Math.max(0, maxRows - h);
     }
     return { x: finalX, y: finalY };
  }
  
  getMinHeightPx(rowCount: number, config: GridConfig): number {
      return (rowCount * config.cellH) + ((rowCount - 1) * config.gap) + (config.paddingY * 2);
  }
}
