
import { Injectable, signal, computed } from '@angular/core';
import { UiComponent, SectionSettings } from '../domain/models/section.model';
import { Block, BackgroundStyle } from '../domain/models/block.model';
import { ColorThemeType } from '../domain/models/builder-document.model';


@Injectable({
  providedIn: 'root'
})
export class EditorStore { 
  // State
  readonly uiComponents = signal<UiComponent[]>([
    { 
        id: '1', 
        type: 'hero', 
        title: 'Don Mosley', 
        description: 'Architecting digital dreams.', 
        bg: 'green',
        blocks: [],
        settings: this.getDefaultSettings('DARK_1')
    },
    { 
        id: '2', 
        type: 'content', 
        title: 'Selected Works', 
        description: 'A curation of spaces.', 
        bg: 'white',
        blocks: [],
        settings: this.getDefaultSettings('LIGHTEST_1') 
    }
  ]);
  
  readonly selectedComponentId = signal<string | null>(null);
  readonly selectedBlockId = signal<string | null>(null);
  readonly isDragging = signal<boolean>(false);
  readonly draggedBlockInfo = signal<{ type: string, w: number, h: number, offsetX: number, offsetY: number } | null>(null);
  
  // UI State for Drawers
  readonly isStyleDrawerOpen = signal<boolean>(false);

  readonly selectedComponent = computed(() => 
    this.uiComponents().find(c => c.id === this.selectedComponentId())
  );

  readonly selectedBlock = computed(() => {
    const blockId = this.selectedBlockId();
    if (!blockId) return null;
    for(const comp of this.uiComponents()) {
        const block = comp.blocks?.find(b => b.id === blockId);
        if (block) return block;
    }
    return null;
  });

  readonly activeSectionBackgroundStyle = computed(() => {
     return this.selectedComponent()?.settings?.backgroundStyle || this.getDefaultBackgroundStyle();
  });

  readonly activeBlockBackgroundStyle = computed(() => {
     return this.selectedBlock()?.style || this.getDefaultBackgroundStyle();
  });

  getDefaultBackgroundStyle(): BackgroundStyle {
      return {
          enabled: false,
          color: { r: 255, g: 255, b: 255, a: 1 },
          stroke: 'none',
          cornerRadius: 0,
          paddingPreset: 'M',
          paddingTopBottomPct: 6,
          paddingLeftRightPct: 6,
          blendMode: 'normal',
          blurEnabled: false,
          blurMode: 'backdrop',
          blurAmountPx: 10
      };
  }

  getDefaultSettings(theme: ColorThemeType = 'LIGHTEST_1'): SectionSettings {
      return {
          design: {
              grid: { rowCount: 16, gap: 'small' }, 
              section: { fillScreen: true, height: 'M', alignment: 'center' },
              styling: { divider: false },
              anchor: ''
          },
          background: { type: 'image', width: 'full-bleed' },
          backgroundStyle: this.getDefaultBackgroundStyle(),
          colorTheme: theme
      };
  }

  addComponent(type: UiComponent['type'], index?: number) {
    const newComp: UiComponent = {
      id: crypto.randomUUID(),
      type,
      title: 'New Section',
      description: 'Content description',
      bg: 'white',
      blocks: [],
      settings: this.getDefaultSettings()
    };
    this.uiComponents.update(list => {
      const result = [...list];
      result.splice(index ?? list.length, 0, newComp);
      return result;
    });
  }

  removeComponent(id: string) {
    this.uiComponents.update(list => list.filter(c => c.id !== id));
  }

  updateComponentSettings(id: string, settings: SectionSettings) {
      this.uiComponents.update(list => 
        list.map(c => c.id === id ? { ...c, settings: { ...settings } } : c)
      );
  }

  updateSectionBackgroundStyle(id: string, updates: Partial<BackgroundStyle>) {
    this.uiComponents.update(list => 
        list.map(c => {
            if (c.id === id && c.settings) {
                return {
                    ...c,
                    settings: {
                        ...c.settings,
                        backgroundStyle: { ...c.settings.backgroundStyle, ...updates }
                    }
                };
            }
            return c;
        })
    );
  }

  updateBlockStyle(blockId: string, updates: Partial<BackgroundStyle>) {
      this.uiComponents.update(list => 
        list.map(c => ({
            ...c,
            blocks: c.blocks?.map(b => {
                if (b.id === blockId) {
                    const currentStyle = b.style || this.getDefaultBackgroundStyle();
                    return { ...b, style: { ...currentStyle, ...updates } };
                }
                return b;
            })
        }))
      );
  }

  addBlockToComponent(componentId: string, blockType: string, position?: {x: number, y: number, w: number, h: number}) {
      const defaults = this.getBlockDefaults(blockType);
      const block: Block = {
          id: crypto.randomUUID(),
          type: blockType,
          x: position?.x ?? 0, y: position?.y ?? 0,
          w: position?.w ?? defaults.w, h: position?.h ?? defaults.h,
          content: this.getBlockContentDefaults(blockType)
      };
      this.uiComponents.update(list => 
          list.map(c => c.id === componentId ? { ...c, blocks: [...(c.blocks || []), block] } : c)
      );
      this.selectedBlockId.set(block.id);
  }

  setBlocksForComponent(componentId: string, newBlocks: Partial<Block>[]) {
    this.uiComponents.update(list =>
        list.map(c => {
            if (c.id === componentId) {
                const freshBlocks: Block[] = newBlocks.map(b => ({
                    id: crypto.randomUUID(),
                    type: b.type || 'text',
                    x: b.x || 0,
                    y: b.y || 0,
                    w: b.w || 4,
                    h: b.h || 2,
                    content: b.content || this.getBlockContentDefaults(b.type || 'text')
                }));
                return { ...c, blocks: freshBlocks };
            }
            return c;
        })
    );
    this.selectedBlockId.set(null);
  }

  reorderBlocks(componentId: string, orderedBlocks: Block[]) {
    this.uiComponents.update(list =>
      list.map(c => {
        if (c.id === componentId) {
          if (c.blocks?.length !== orderedBlocks.length) return c;
          return { ...c, blocks: orderedBlocks };
        }
        return c;
      })
    );
  }

  moveBlockToSection(sourceId: string, targetId: string, blockId: string, x: number, y: number) {
      const block = this.uiComponents().find(c => c.id === sourceId)?.blocks?.find(b => b.id === blockId);
      if (!block) return;
      this.deleteBlock(sourceId, blockId);
      const newBlock = { ...block, x, y };
      this.uiComponents.update(list => 
        list.map(c => c.id === targetId ? { ...c, blocks: [...(c.blocks || []), newBlock] } : c)
      );
      this.selectedBlockId.set(blockId);
  }

  updateBlock(componentId: string, blockId: string, updates: Partial<Block>) {
      this.uiComponents.update(list => 
        list.map(c => c.id === componentId ? {
            ...c, blocks: c.blocks?.map(b => b.id === blockId ? { ...b, ...updates } : b)
        } : c)
      );
  }

  deleteBlock(componentId: string, blockId: string) {
      this.uiComponents.update(list => 
        list.map(c => c.id === componentId ? {
            ...c, blocks: c.blocks?.filter(b => b.id !== blockId)
        } : c)
      );
  }

  duplicateBlock(sectionId: string, blockId: string) {
    this.uiComponents.update(list => {
      const componentIndex = list.findIndex(c => c.id === sectionId);
      if (componentIndex === -1) return list;

      const component = list[componentIndex];
      const block = component.blocks?.find(b => b.id === blockId);
      if (!block) return list;

      const newBlock: Block = {
        ...JSON.parse(JSON.stringify(block)),
        id: crypto.randomUUID(),
        x: block.x + 1,
        y: block.y + 1,
      };

      const newComponent = { ...component, blocks: [...(component.blocks || []), newBlock] };

      const newList = [...list];
      newList[componentIndex] = newComponent;
      return newList;
    });
  }

  moveBlockInStack(sectionId: string, blockId: string, direction: 'forward' | 'backward') {
    this.uiComponents.update(list => {
      const componentIndex = list.findIndex(c => c.id === sectionId);
      if (componentIndex === -1) return list;
      
      const component = list[componentIndex];
      const blocks = [...(component.blocks || [])];
      const index = blocks.findIndex(b => b.id === blockId);

      if (index === -1) return list;

      if (direction === 'forward' && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      } else if (direction === 'backward' && index > 0) {
        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      } else {
        return list;
      }
      
      const newComponent = { ...component, blocks };
      const newList = [...list];
      newList[componentIndex] = newComponent;
      return newList;
    });
  }

  duplicateSection(sectionId: string) {
    this.uiComponents.update(list => {
      const sectionIndex = list.findIndex(c => c.id === sectionId);
      if (sectionIndex === -1) return list;

      const section = list[sectionIndex];
      
      const newSection: UiComponent = JSON.parse(JSON.stringify(section));
      newSection.id = crypto.randomUUID();
      if (newSection.blocks) {
        newSection.blocks = newSection.blocks.map(b => ({
          ...b,
          id: crypto.randomUUID()
        }));
      }

      const newList = [...list];
      newList.splice(sectionIndex + 1, 0, newSection);
      return newList;
    });
  }

  moveSection(sectionId: string, direction: 'up' | 'down') {
    this.uiComponents.update(list => {
      const index = list.findIndex(c => c.id === sectionId);
      if (index === -1) return list;

      const newList = [...list];

      if (direction === 'up' && index > 0) {
        [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
      } else if (direction === 'down' && index < list.length - 1) {
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      } else {
        return list; 
      }
      return newList;
    });
  }

  getBlockDefaults(type: string): { w: number, h: number } {
      switch(type) {
          case 'text': return { w: 6, h: 2 };
          case 'button': return { w: 4, h: 2 };
          case 'image': return { w: 8, h: 8 };
          default: return { w: 6, h: 4 };
      }
  }

  getBlockContentDefaults(type: string): any {
    switch(type) {
        case 'text': return '<h2>Start writing...</h2><p>Double-click to edit this text block.</p>';
        case 'button': return { label: 'Learn More', href: '#', style: 'primary' };
        case 'image': return { src: '', alt: 'Placeholder image' };
        default: return {};
    }
  }
}
