
import { Injectable, signal, computed, inject } from '@angular/core';
import { UiComponent } from '../../features/websites/website-detail-builder/domain/models/section.model';
import { EditorStore } from '../../features/websites/website-detail-builder/data/website-detail-builder.store';
// Fix: Corrected import path for WorkflowStore.
import { WorkflowStore, Workflow } from '../../features/workflow/state/workflow.store';
import { WebsitesStore } from '../../features/websites/data/websites.store';
import { PageInfo, Website } from '../../features/websites/domain/website.models';
import { DEFAULT_GRID } from '../../features/websites/website-detail-builder/domain/models/builder-document.model';
import { Block } from '../../features/websites/website-detail-builder/domain/models/block.model';

// Exporting types for legacy compatibility during refactor
export * from '../../features/websites/website-detail-builder/domain/models/section.model';
export * from '../../features/workflow/state/workflow.store';

export const GRID_CONFIG = DEFAULT_GRID;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  ui: UiComponent[];
  workflows: Workflow[];
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Feature Stores (Injected)
  readonly editorStore = inject(EditorStore);
  readonly workflowStore = inject(WorkflowStore);
  readonly websitesStore = inject(WebsitesStore);

  // App Navigation State (Should be replaced by router state)
  readonly activeView = signal<'dashboard' | 'website' | 'pages-list' | 'page-builder' | 'workflow' | 'deploy'>('dashboard');
  readonly viewMode = signal<'desktop' | 'mobile'>('desktop');
  readonly activePageId = signal<string | null>('home');
  
  // Data now lives in feature stores, these are just facades
  get websites() { return this.websitesStore.websites; }
  get pages() { return this.websitesStore.pages; }
  
  // History State (App Level)
  readonly history = signal<HistoryEntry[]>([]);
  readonly historyIndex = signal<number>(0); 
  readonly lastSaved = signal<Date | null>(null);

  // Facade Accessors for Feature State
  get uiComponents() { return this.editorStore.uiComponents; }
  get selectedComponentId() { return this.editorStore.selectedComponentId; }
  get selectedBlockId() { return this.editorStore.selectedBlockId; }
  get isDragging() { return this.editorStore.isDragging; }
  
  get workflows() { return this.workflowStore.workflows; }
  get activeWorkflowId() { return this.workflowStore.activeWorkflowId; }
  get selectedNodeId() { return this.workflowStore.selectedNodeId; }
  get execution() { return this.workflowStore.execution; }
  get workflowScope() { return this.workflowStore.workflowScope; }
  get focusedNodeId() { return this.workflowStore.focusedNodeId; }
  
  get activeWorkflow() { return this.workflowStore.activeWorkflow; }
  get activeNodes() { return this.workflowStore.activeNodes; }
  get selectedNode() { return this.workflowStore.selectedNode; }
  get visibleWorkflows() { return this.workflowStore.visibleWorkflows; }

  readonly activePage = computed(() => {
     const id = this.activePageId();
     if (!id) return null;
     for(const group of this.pages()) {
         const found = group.items.find(p => p.id === id);
         if (found) return found;
     }
     return null;
  });

  readonly canUndo = computed(() => this.historyIndex() < this.history().length - 1);
  readonly canRedo = computed(() => this.historyIndex() > 0);

  constructor() {
    this.loadState();
    if (this.history().length === 0) {
       this.commit('Initial State');
    }

    setInterval(() => {
      this.saveState();
    }, 30000);
  }

  toggleGroup(category: string) {
      this.websitesStore.toggleGroup(category);
  }

  saveState() {
    // This will need to call individual store save methods
  }

  loadState() {
    // This will need to call individual store load methods
  }

  commit(label: string) {
    // This logic should move to the builder store
  }
  undo() {}
  redo() {}
  restoreHistory(entry: HistoryEntry) {}
  private applyState(entry: HistoryEntry) {}

  // --- Delegate Methods to Stores (Facade) ---
  // Editor
  addComponent(type: any) { this.editorStore.addComponent(type); }
  insertComponent(idx: number, type: any) { this.editorStore.addComponent(type, idx); }
  removeComponent(id: string) { this.editorStore.removeComponent(id); }
  updateComponentSettings(id: string, s: any) { this.editorStore.updateComponentSettings(id, s); }
  addBlockToComponent(cId: string, type: string, pos?: any) { this.editorStore.addBlockToComponent(cId, type, pos); }
  moveBlockToSection(sId: string, tId: string, bId: string, x: number, y: number) { this.editorStore.moveBlockToSection(sId, tId, bId, x, y); }
  updateBlock(cId: string, bId: string, u: any) { this.editorStore.updateBlock(cId, bId, u); }
  deleteBlock(cId: string, bId: string) { this.editorStore.deleteBlock(cId, bId); }
  setBlocksForComponent(cId: string, blocks: Partial<Block>[]) { this.editorStore.setBlocksForComponent(cId, blocks); }
  reorderBlocks(cId: string, blocks: Block[]) { this.editorStore.reorderBlocks(cId, blocks); }
  duplicateBlock(sId: string, bId: string) { this.editorStore.duplicateBlock(sId, bId); }
  moveBlockInStack(sId: string, bId: string, dir: 'forward' | 'backward') { this.editorStore.moveBlockInStack(sId, bId, dir); }
  getDefaultSettings(t?: any) { return this.editorStore.getDefaultSettings(t); }
  getBlockDefaults(t: string) { return this.editorStore.getBlockDefaults(t); }
  duplicateSection(sId: string) { this.editorStore.duplicateSection(sId); }
  moveSection(sId: string, dir: 'up' | 'down') { this.editorStore.moveSection(sId, dir); }

  // Workflow
  createWorkflow(n: string, s: any) { return this.workflowStore.createWorkflow(n, s); }
  updateActiveWorkflow(u: any) { this.workflowStore.updateActiveWorkflow(u); }
  addNode(t: any, x: number, y: number) { this.workflowStore.addNode(t, x, y); }
  updateNode(id: string, u: any) { this.workflowStore.updateNode(id, u); }
  updateNodeConfig(id: string, k: string, v: any) { this.workflowStore.updateNodeConfig(id, k, v); }
  updateNodePosition(id: string, x: number, y: number) { this.workflowStore.updateNodePosition(id, x, y); }
  removeNode(id: string) { this.workflowStore.removeNode(id); }
  connectNodes(s: string, t: string, p?: string) { return this.workflowStore.connectNodes(s, t, p); }
  removeConnection(s: string, t: string) { this.workflowStore.removeConnection(s, t); }
  toggleBreakpoint(id: string) { this.workflowStore.toggleBreakpoint(id); }
  startExecution() { this.workflowStore.startExecution(); }
  stopExecution() { this.workflowStore.stopExecution(); }
  resumeExecution() { this.workflowStore.resumeExecution(); }
  stepExecution() { this.workflowStore.stepExecution(); }
  addWorkflowParameter(w: string, t: any) { this.workflowStore.addWorkflowParameter(w, t); }
  updateWorkflowParameter(w: string, t: any, p: string, u: any) { this.workflowStore.updateWorkflowParameter(w, t, p, u); }
  removeWorkflowParameter(w: string, t: any, p: string) { this.workflowStore.removeWorkflowParameter(w, t, p); }
  duplicateNode(id: string) { this.workflowStore.duplicateNode(id); }
  insertNodeBetween(s: string, t: string, type: any, x: number, y: number) { this.workflowStore.insertNodeBetween(s, t, type, x, y); }

}
