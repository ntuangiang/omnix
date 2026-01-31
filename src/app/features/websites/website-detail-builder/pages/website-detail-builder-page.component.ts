
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../../core/services/state.service';
import { SectionSettings, UiComponent } from '../domain/models/section.model';
import { WebsiteBuilderTopbarComponent } from '../ui/layout/website-builder-topbar.component';
import { SectionCanvasComponent } from '../ui/canvas/section-canvas.component';
import { AddSectionDrawerComponent } from '../ui/panels/add-section-drawer.component';
import { AddBlockDrawerComponent } from '../ui/panels/add-block-drawer.component';
import { SectionSettingsDrawerComponent } from '../ui/panels/section-settings-drawer.component';
import { LayoutsDrawerComponent } from '../ui/panels/layouts-drawer.component';
import { StyleBackgroundDrawerComponent } from '../ui/panels/style-background/style-background-drawer.component'; 
import { Block } from '../domain/models/block.model';
import { BlockContextMenuComponent, BlockContextMenu } from '../ui/selection/block-context-menu.component';
import { ClickOutsideDirective } from '../../../../core/directives/click-outside.directive';
import { BlockPropertiesPanelComponent } from '../ui/panels/block-properties-panel.component';
import { GridSnapService } from '../dnd/grid-snap.service';
import { DEFAULT_GRID } from '../domain/models/builder-document.model';
import { TextEditorFacade } from '../services/text-editor.facade';

@Component({
  selector: 'app-website-detail-builder-page',
  standalone: true,
  imports: [
    CommonModule,
    WebsiteBuilderTopbarComponent,
    SectionCanvasComponent,
    AddSectionDrawerComponent,
    AddBlockDrawerComponent,
    SectionSettingsDrawerComponent,
    LayoutsDrawerComponent,
    StyleBackgroundDrawerComponent,
    BlockContextMenuComponent,
    ClickOutsideDirective,
    BlockPropertiesPanelComponent
  ],
  template: `
    <div class="fixed inset-0 z-50 bg-white flex flex-col font-sans overflow-hidden">
      
      <app-website-builder-topbar></app-website-builder-topbar>

      <!-- Main Canvas -->
      <div id="builder-viewport" class="flex-1 overflow-y-auto bg-slate-50 flex justify-center cursor-default scroll-smooth" (click)="deselect()">
          
          <div [class]="state.viewMode() === 'mobile' ? 'w-[375px] my-10 min-h-[667px]' : 'w-full'"
               class="bg-white relative shadow-sm min-h-screen transition-all duration-300 pb-20 border-2 border-transparent">

             <!-- Page Header (Mock) -->
             <header class="absolute top-0 left-0 w-full px-12 py-8 flex items-center justify-between z-30 pointer-events-none text-slate-900 text-[11px] font-bold tracking-[0.2em] uppercase mix-blend-difference">
                <nav class="hidden md:flex gap-8 items-center w-1/3">
                   <span class="cursor-pointer pointer-events-auto">Store</span>
                   <span class="cursor-pointer pointer-events-auto">Bio</span>
                </nav>
                <div class="w-1/3 text-center">
                   <span class="text-3xl font-serif italic normal-case tracking-normal cursor-pointer pointer-events-auto">Nexus.</span>
                </div>
                <div class="w-1/3 flex justify-end gap-8 items-center"><span class="cursor-pointer pointer-events-auto">Cart (0)</span></div>
             </header>

             <!-- Sections List -->
             <div class="flex flex-col relative min-h-screen pt-24">
                 @if (state.uiComponents().length === 0) {
                     <div class="h-[60vh] flex flex-col items-center justify-center">
                        <button (click)="openToolbox(0)" class="bg-blue-600 text-white px-6 h-9 flex items-center rounded-full text-sm font-bold shadow-lg hover:bg-blue-500 transition-colors">+ Add First Section</button>
                     </div>
                 } @else {
                    <!-- Add Section Divider (Top) -->
                    <div class="relative h-8 -my-4 z-50 flex items-center justify-center pointer-events-auto"
                         (mouseenter)="hoveredDividerIndex.set(-1)"
                         (mouseleave)="hoveredDividerIndex.set(null)">
                        @let firstComp = state.uiComponents()[0];
                        @let isFirstActive = selectedSectionId() === firstComp.id || hoveredSectionId() === firstComp.id;
                        @let showButton = isFirstActive || hoveredDividerIndex() === -1;
                        <div class="absolute inset-x-12 h-px bg-blue-500 transition-opacity" [class.opacity-100]="showButton" [class.opacity-0]="!showButton"></div>
                        <button (click)="openToolbox(0)" class="relative bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm transition-transform pointer-events-auto" [class.scale-100]="showButton" [class.scale-0]="!showButton">
                            Add Section
                        </button>
                    </div>
                 }

                 @for (comp of state.uiComponents(); track comp.id; let i = $index) {
                     <!-- Section Component -->
                     <app-section-canvas
                        [component]="comp"
                        [isSelected]="selectedSectionId() === comp.id"
                        [selectedBlockId]="state.selectedBlockId()"
                        [editingBlockId]="editingBlockId()"
                        [showTopBorder]="hoveredDividerIndex() === i - 1"
                        [showBottomBorder]="hoveredDividerIndex() === i"
                        (select)="selectSection(comp.id)"
                        (editSection)="editSection(comp.id)"
                        (removeSection)="state.removeComponent(comp.id)"
                        (duplicateSection)="onDuplicateSection($event)"
                        (moveSection)="onMoveSection($event)"
                        (addBlockClick)="openBlockPicker(comp.id, $event)"
                        (viewLayouts)="onViewLayouts(comp.id)"
                        
                        (mouseEnter)="hoveredSectionId.set(comp.id)"
                        (mouseLeave)="hoveredSectionId.set(null)"
                        
                        (blockSelect)="selectBlock($event)"
                        (blockEdit)="enterBlockEditMode($event)"
                        (blockStopEdit)="stopEditingBlock()"
                        (blockRemove)="onBlockRemove($event)"
                        (blockUpdate)="onBlockUpdate($event)"
                        (blockReorder)="onBlockReorder($event, comp.id)"
                        (blockResizeEnd)="onBlockResizeEnd()"
                        (rowResizeEnd)="onSectionRowResizeEnd()"
                        (blockShowProperties)="openBlockPropertiesPanel($event)"
                        (blockContextMenu)="openBlockContextMenu({ event: $event.event, blockId: $event.blockId, sectionId: comp.id })"
                        (openStyleBackground)="onOpenStyleBackground()"
                     ></app-section-canvas>
                     
                     <!-- Add Section Divider -->
                     <div class="relative h-8 -my-4 z-50 flex items-center justify-center pointer-events-auto"
                          (mouseenter)="hoveredDividerIndex.set(i)"
                          (mouseleave)="hoveredDividerIndex.set(null)">
                        @let nextComp = state.uiComponents()[i + 1];
                        @let isCurrentSectionActive = selectedSectionId() === comp.id || hoveredSectionId() === comp.id;
                        @let isNextSectionActive = nextComp && (selectedSectionId() === nextComp.id || hoveredSectionId() === nextComp.id);
                        @let showButton = isCurrentSectionActive || isNextSectionActive || hoveredDividerIndex() === i;

                         <div class="absolute inset-x-12 h-px bg-blue-500 transition-opacity" [class.opacity-100]="showButton" [class.opacity-0]="!showButton"></div>
                         <button (click)="openToolbox(i + 1)" class="relative bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm transition-transform pointer-events-auto" [class.scale-100]="showButton" [class.scale-0]="!showButton">
                             Add Section
                         </button>
                     </div>
                 }
             </div>

             <!-- Floating Block Properties Panel (Anchor to block) -->
             @if (editingPropertiesBlockId()) {
                <div (appClickOutside)="closeBlockPropertiesPanel()">
                    <app-block-properties-panel
                        [block]="editingBlockProperties()?.block"
                        [position]="blockScreenPosition()"
                        (contentUpdate)="onBlockContentUpdate($event)"
                        (close)="closeBlockPropertiesPanel()">
                    </app-block-properties-panel>
                </div>
             }
          </div>
      </div>
      
      <!-- Context Menu -->
      @if (blockContextMenu()) {
         <app-block-context-menu
            (appClickOutside)="closeBlockContextMenu()"
            [menu]="blockContextMenu()"
            (menuAction)="handleBlockMenuAction($event)">
         </app-block-context-menu>
      }

      <!-- Modals & Drawers -->
      <app-add-section-drawer
        [isOpen]="showToolbox()" 
        (close)="showToolbox.set(false)" 
        (select)="addSection($event)">
      </app-add-section-drawer>

      <app-add-block-drawer
        [isOpen]="showBlockPicker()" 
        (close)="showBlockPicker.set(false)" 
        (selectBlock)="onBlockSelected($event)">
      </app-add-block-drawer>

      @if (editingSectionSettings()) {
         <app-section-settings-drawer
            [isOpen]="showEditPanel()" 
            [settings]="editingSectionSettings()!" 
            (close)="closeEditPanel()" 
            (settingsChange)="onSettingsChanged($event)"
            (openStyleBackground)="onOpenStyleBackground()">
         </app-section-settings-drawer>
      }

      <app-layouts-drawer
        [isOpen]="showLayoutsPanel()"
        (close)="showLayoutsPanel.set(false)"
        (applyLayout)="onApplyLayout($event)">
      </app-layouts-drawer>
      
      <!-- Style Background Drawer -->
      <app-style-background-drawer
         [isOpen]="showStyleDrawer()"
         [mode]="styleDrawerMode()"
         (close)="showStyleDrawer.set(false)">
      </app-style-background-drawer>
    </div>
  `
})
export class WebsiteDetailBuilderPageComponent {
  state = inject(StateService);
  gridSnapService = inject(GridSnapService);
  textEditor = inject(TextEditorFacade);

  // Selection State
  selectedSectionId = signal<string | null>(null);
  hoveredSectionId = signal<string | null>(null);
  hoveredDividerIndex = signal<number | null>(null);
  editingBlockId = signal<string | null>(null);
  editingPropertiesBlockId = signal<string | null>(null);

  // Modal State
  showToolbox = signal<boolean>(false);
  showBlockPicker = signal<boolean>(false);
  showEditPanel = signal<boolean>(false);
  showLayoutsPanel = signal<boolean>(false);
  showStyleDrawer = signal<boolean>(false);
  styleDrawerMode = signal<'section' | 'block'>('section');
  blockContextMenu = signal<BlockContextMenu | null>(null);

  // Context State
  insertIndex = signal<number>(0);
  activeSectionForBlock = signal<string | null>(null);
  editingSectionId = signal<string | null>(null);
  private propertyUpdateTimeout: any;

  editingSectionSettings = computed(() => {
     if (!this.editingSectionId()) return null;
     const comp = this.state.uiComponents().find(c => c.id === this.editingSectionId());
     return comp?.settings ? comp.settings : this.state.getDefaultSettings(); 
  });

  editingBlockProperties = computed(() => {
    const blockId = this.editingPropertiesBlockId();
    if (!blockId) return null;
    for (const section of this.state.uiComponents()) {
        const block = section.blocks?.find(b => b.id === blockId);
        if (block) return { block, sectionId: section.id };
    }
    return null;
  });

  blockScreenPosition = computed(() => {
      const props = this.editingBlockProperties();
      if (!props) return null;

      const { block, sectionId } = props;
      const config = DEFAULT_GRID;
      
      const yPxInSection = this.gridSnapService.getPx(block.y, 'y', config);
      const xPxInSection = this.gridSnapService.getPx(block.x, 'x', config);
      const wPx = this.gridSnapService.getPx(block.w, 'w', config);

      const sectionIndex = this.state.uiComponents().findIndex(c => c.id === sectionId);
      let yOffset = 24 * 4; 
      
      for(let i = 0; i < sectionIndex; i++) {
          const comp = this.state.uiComponents()[i];
          const settings = comp.settings;
          const rowCount = settings?.design.grid.rowCount ?? 24;
          yOffset += this.gridSnapService.getMinHeightPx(rowCount, config);
      }

      return {
          x: xPxInSection + wPx + 20,
          y: yOffset + yPxInSection
      };
  });

  // --- Actions ---

  deselect() {
      this.selectedSectionId.set(null);
      this.state.selectedBlockId.set(null);
      this.editingBlockId.set(null);
      this.closeBlockContextMenu();
      this.closeBlockPropertiesPanel();
      this.showStyleDrawer.set(false);
      this.textEditor.stopEditing();
  }

  selectSection(id: string) {
      this.selectedSectionId.set(id);
      this.state.selectedBlockId.set(null);
      this.editingBlockId.set(null);
      this.closeBlockContextMenu();
      this.showStyleDrawer.set(false);
      this.textEditor.stopEditing();
  }

  editSection(id: string) {
     this.closeBlockContextMenu();
     this.state.selectedComponentId.set(id);
     const comp = this.state.uiComponents().find(c => c.id === id);
     if (comp && !comp.settings) this.state.updateComponentSettings(id, this.state.getDefaultSettings());
     this.editingSectionId.set(id);
     this.showEditPanel.set(true);
  }
  
  onOpenStyleBackground() {
      this.closeEditPanel();
      
      const blockId = this.state.selectedBlockId();
      
      if (blockId) {
         this.styleDrawerMode.set('block');
      } else {
         this.styleDrawerMode.set('section');
         if (this.selectedSectionId()) {
             this.state.selectedComponentId.set(this.selectedSectionId());
         }
      }

      this.showStyleDrawer.set(true);
  }

  onDuplicateSection(sectionId: string) {
    this.closeBlockContextMenu();
    this.state.duplicateSection(sectionId);
  }

  onMoveSection(event: { sectionId: string; direction: 'up' | 'down' }) {
    this.closeBlockContextMenu();
    this.state.moveSection(event.sectionId, event.direction);
  }

  closeEditPanel() {
      this.showEditPanel.set(false);
      setTimeout(() => this.editingSectionId.set(null), 300);
  }

  onSettingsChanged(newSettings: SectionSettings) {
      if (this.editingSectionId()) this.state.updateComponentSettings(this.editingSectionId()!, newSettings);
  }

  // --- Toolbox ---

  openToolbox(index: number) { 
      this.closeBlockContextMenu();
      this.insertIndex.set(index); 
      this.showToolbox.set(true); 
  }

  addSection(type: string) { 
      this.state.insertComponent(this.insertIndex(), type as UiComponent['type']); 
      this.showToolbox.set(false); 
  }

  // --- Layouts ---
  onViewLayouts(sectionId: string) {
    this.selectSection(sectionId);
    this.showLayoutsPanel.set(true);
  }

  onApplyLayout(blocks: Partial<Block>[]) {
    const sectionId = this.selectedSectionId();
    if (sectionId) {
        this.state.setBlocksForComponent(sectionId, blocks);
        this.state.commit('Applied Layout');
    }
    this.showLayoutsPanel.set(false);
  }

  // --- Blocks ---

  openBlockPicker(sectionId: string, event: MouseEvent) {
      event.stopPropagation();
      this.closeBlockContextMenu();
      this.activeSectionForBlock.set(sectionId);
      this.showBlockPicker.set(true);
  }

  onBlockSelected(type: string) {
      if (this.activeSectionForBlock()) {
         this.state.addBlockToComponent(this.activeSectionForBlock()!, type);
      }
      this.showBlockPicker.set(false);
  }

  selectBlock(blockId: string) {
      this.state.selectedBlockId.set(blockId);
      this.editingBlockId.set(null); 
      this.closeBlockContextMenu();
      this.textEditor.stopEditing();
  }

  enterBlockEditMode(blockId: string) {
      this.editingBlockId.set(blockId);
      this.closeBlockContextMenu();
  }

  stopEditingBlock() {
      this.editingBlockId.set(null);
      this.textEditor.stopEditing();
  }

  onBlockRemove(data: {sectionId: string, blockId: string}) {
      this.closeBlockContextMenu();
      this.state.deleteBlock(data.sectionId, data.blockId);
  }

  onBlockUpdate(data: { sectionId: string, blockId: string, updates: Partial<Block> }) {
    this.state.updateBlock(data.sectionId, data.blockId, data.updates);
  }

  onBlockContentUpdate(contentUpdates: Partial<any>) {
    const selection = this.editingBlockProperties();
    if (!selection) return;

    const newContent = { ...selection.block.content, ...contentUpdates };
    this.state.updateBlock(selection.sectionId, selection.block.id, { content: newContent });

    clearTimeout(this.propertyUpdateTimeout);
    this.propertyUpdateTimeout = setTimeout(() => {
        this.state.commit('Updated block properties');
    }, 500);
  }

  onBlockReorder(orderedBlocks: Block[], sectionId: string) {
    this.state.reorderBlocks(sectionId, orderedBlocks);
    this.state.commit('Reordered Layers');
  }
  
  onBlockResizeEnd() {
    this.state.commit('Resized Block');
  }
  
  onSectionRowResizeEnd() {
    this.state.commit('Resized Section Height');
  }

  openBlockPropertiesPanel(blockId: string) {
    this.editingPropertiesBlockId.set(blockId);
    this.selectBlock(blockId);
  }

  closeBlockPropertiesPanel() {
    this.editingPropertiesBlockId.set(null);
  }

  // --- Context Menu ---
  openBlockContextMenu(data: { event: MouseEvent; blockId: string; sectionId: string }) {
    this.editingBlockId.set(null);
    this.state.selectedBlockId.set(data.blockId);
    this.selectedSectionId.set(data.sectionId);

    this.blockContextMenu.set({
      x: data.event.clientX,
      y: data.event.clientY,
      blockId: data.blockId,
      sectionId: data.sectionId,
    });
  }

  closeBlockContextMenu() {
    this.blockContextMenu.set(null);
  }

  handleBlockMenuAction(action: { action: string; blockId: string; sectionId: string; }) {
    switch (action.action) {
      case 'duplicate':
        this.state.duplicateBlock(action.sectionId, action.blockId);
        break;
      case 'properties':
        this.openBlockPropertiesPanel(action.blockId);
        break;
      case 'delete':
        this.state.deleteBlock(action.sectionId, action.blockId);
        break;
      case 'bringForward':
        this.state.moveBlockInStack(action.sectionId, action.blockId, 'forward');
        break;
      case 'sendBackward':
        this.state.moveBlockInStack(action.sectionId, action.blockId, 'backward');
        break;
    }
    this.closeBlockContextMenu();
  }
}
