
import { Injectable, signal, computed } from '@angular/core';

export interface NodeParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'any';
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'assign' | 'if' | 'switch' | 'foreach' | 'action' | 'return';
  label: string;
  x: number;
  y: number;
  connections: string[]; 
  outputs: Record<string, string>; 
  config: Record<string, any>;
  isBreakpoint?: boolean; 
}

export interface Workflow {
  id: string;
  name: string;
  scope: 'server' | 'client';
  inputs: NodeParameter[];
  outputs: NodeParameter[];
  locals: NodeParameter[];
  nodes: WorkflowNode[];
}

export interface ExecutionState {
  status: 'idle' | 'running' | 'paused';
  currentNodeId: string | null;
  variables: Record<string, any>;
  logs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowStore {
  
  readonly workflows = signal<Workflow[]>([
    {
        id: 'w1',
        name: 'fetchUsers',
        scope: 'server',
        inputs: [{id: 'p1', name: 'limit', type: 'number'}],
        outputs: [{id: 'p2', name: 'users', type: 'json'}],
        locals: [{id: 'p3', name: 'dbResult', type: 'json'}],
        nodes: [
            { id: 'n1', type: 'start', label: 'Start', x: 100, y: 100, connections: ['n2'], outputs: {'n2': 'right'}, config: {} },
            { id: 'n2', type: 'action', label: 'DB Select', x: 350, y: 100, connections: ['n3'], outputs: {'n3': 'right'}, config: { query: 'SELECT * FROM users' } },
            { id: 'n3', type: 'return', label: 'Return', x: 600, y: 100, connections: [], outputs: {}, config: {} }
        ]
    }
  ]);
  
  readonly activeWorkflowId = signal<string | null>('w1');
  readonly selectedNodeId = signal<string | null>(null);
  readonly workflowScope = signal<'server' | 'client'>('server');
  readonly focusedNodeId = signal<string | null>(null);

  readonly execution = signal<ExecutionState>({
    status: 'idle',
    currentNodeId: null,
    variables: {},
    logs: []
  });

  // Computed
  readonly activeWorkflow = computed(() => 
    this.workflows().find(w => w.id === this.activeWorkflowId())
  );

  readonly activeNodes = computed(() => 
    this.activeWorkflow()?.nodes || []
  );

  readonly selectedNode = computed(() => 
    this.activeNodes().find(n => n.id === this.selectedNodeId())
  );

  readonly visibleWorkflows = computed(() => 
    this.workflows().filter(w => w.scope === this.workflowScope())
  );

  // Actions
  createWorkflow(name: string, scope: 'server' | 'client'): string {
      const id = crypto.randomUUID();
      const newWorkflow: Workflow = {
          id,
          name,
          scope,
          inputs: [],
          outputs: [],
          locals: [],
          nodes: [
              { id: crypto.randomUUID(), type: 'start', label: 'Start', x: 50, y: 100, connections: [], outputs: {}, config: {} }
          ]
      };
      this.workflows.update(w => [...w, newWorkflow]);
      return id;
  }

  updateActiveWorkflow(updates: Partial<Workflow>) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      this.workflows.update(list => list.map(w => w.id === activeId ? { ...w, ...updates } : w));
  }

  addNode(type: WorkflowNode['type'], x = 100, y = 100) {
    const activeId = this.activeWorkflowId();
    if (!activeId) return;
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      x,
      y,
      connections: [],
      outputs: {},
      config: {}
    };
    this.workflows.update(list => list.map(w => w.id === activeId ? { ...w, nodes: [...w.nodes, newNode] } : w));
  }

  updateNode(id: string, updates: Partial<WorkflowNode>) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      this.workflows.update(list => list.map(w => w.id === activeId ? {
              ...w,
              nodes: w.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
          } : w));
  }

  updateNodeConfig(id: string, key: string, value: any) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      this.workflows.update(list => list.map(w => w.id === activeId ? {
            ...w,
            nodes: w.nodes.map(n => n.id === id ? { 
                ...n, config: { ...n.config, [key]: value } 
            } : n)
        } : w));
  }
  
  updateNodePosition(id: string, x: number, y: number) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      this.workflows.update(list => list.map(w => w.id === activeId ? {
              ...w,
              nodes: w.nodes.map(n => n.id === id ? { ...n, x, y } : n)
          } : w));
  }

  removeNode(id: string) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      // Cleanup connections
      this.workflows.update(list => list.map(w => w.id === activeId ? {
            ...w,
            nodes: w.nodes.map(n => {
                const newOutputs = {...n.outputs};
                if (newOutputs[id]) delete newOutputs[id];
                return { ...n, connections: n.connections.filter(c => c !== id), outputs: newOutputs };
            })
        } : w));
      
      this.workflows.update(list => list.map(w => w.id === activeId ? {
              ...w,
              nodes: w.nodes.filter(n => n.id !== id)
          } : w));

      if (this.selectedNodeId() === id) this.selectedNodeId.set(null);
  }

  duplicateNode(nodeId: string) {
    const activeId = this.activeWorkflowId();
    if (!activeId) return;
    const wf = this.workflows().find(w => w.id === activeId);
    if (!wf) return;
    const node = wf.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newNode: WorkflowNode = {
      ...JSON.parse(JSON.stringify(node)),
      id: crypto.randomUUID(),
      x: node.x + 50,
      y: node.y + 50,
      connections: [],
      outputs: {},
      label: node.label + ' (Copy)'
    };
    this.workflows.update(list => list.map(w => w.id === activeId ? { ...w, nodes: [...w.nodes, newNode] } : w));
  }
  
  // Params
  addWorkflowParameter(workflowId: string, paramType: 'inputs' | 'outputs' | 'locals') {
      const param: NodeParameter = {
          id: crypto.randomUUID(),
          name: 'new_param',
          type: 'string'
      };
      this.workflows.update(list => list.map(w => w.id === workflowId ? { ...w, [paramType]: [...w[paramType], param] } : w));
  }

  updateWorkflowParameter(workflowId: string, paramType: 'inputs' | 'outputs' | 'locals', paramId: string, updates: Partial<NodeParameter>) {
      this.workflows.update(list => list.map(w => w.id === workflowId ? { 
          ...w, [paramType]: w[paramType].map(p => p.id === paramId ? { ...p, ...updates } : p) 
      } : w));
  }

  removeWorkflowParameter(workflowId: string, paramType: 'inputs' | 'outputs' | 'locals', paramId: string) {
    this.workflows.update(list => list.map(w => w.id === workflowId ? { ...w, [paramType]: w[paramType].filter(p => p.id !== paramId) } : w));
  }

  // Connections
  connectNodes(sourceId: string, targetId: string, portId: string = 'right'): boolean {
    const activeId = this.activeWorkflowId();
    if (!activeId) return false;
    const workflow = this.workflows().find(w => w.id === activeId);
    if (!workflow) return false;
    const source = workflow.nodes.find(n => n.id === sourceId);
    if (!source) return false;
    if (sourceId === targetId) return false;
    if (source.connections.includes(targetId)) return false;
    
    this.workflows.update(list => list.map(w => w.id === activeId ? {
            ...w,
            nodes: w.nodes.map(n => n.id === sourceId ? {
                ...n,
                connections: [...n.connections, targetId],
                outputs: { ...n.outputs, [targetId]: portId }
            } : n)
        } : w));
    return true;
  }

  removeConnection(sourceId: string, targetId: string) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      this.workflows.update(list => list.map(w => w.id === activeId ? {
            ...w,
            nodes: w.nodes.map(n => {
                if (n.id === sourceId) {
                    const newOutputs = {...n.outputs};
                    delete newOutputs[targetId];
                    return { ...n, connections: n.connections.filter(c => c !== targetId), outputs: newOutputs };
                }
                return n;
            })
        } : w));
  }

  insertNodeBetween(sourceId: string, targetId: string, type: WorkflowNode['type'], x: number, y: number) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      const GAP = 250; 
      this.workflows.update(list => list.map(w => {
          if (w.id !== activeId) return w;
          const source = w.nodes.find(n => n.id === sourceId);
          const target = w.nodes.find(n => n.id === targetId);
          let finalX = x;
          let finalY = y;
          let nodesToShift = new Set<string>();
          if (source && target) {
              if (target.x >= source.x - 50) {
                  nodesToShift = this.getDownstreamNodes(w.nodes, targetId, sourceId);
                  finalX = source.x + GAP; 
                  finalY = source.y; 
              }
          }
          const newNodeId = crypto.randomUUID();
          const newNode: WorkflowNode = {
              id: newNodeId,
              type,
              label: type,
              x: finalX,
              y: finalY,
              connections: [targetId],
              outputs: {[targetId]: 'right'},
              config: {}
          };
          const updatedNodes = w.nodes.map(n => {
              let nX = n.x;
              if (nodesToShift.has(n.id)) nX += GAP;
              if (n.id === sourceId) {
                  const newOutputs = {...n.outputs};
                  const existingPort = newOutputs[targetId] || 'right';
                  delete newOutputs[targetId];
                  newOutputs[newNodeId] = existingPort; 
                  return { ...n, x: nX, connections: n.connections.map(c => c === targetId ? newNodeId : c), outputs: newOutputs };
              }
              return { ...n, x: nX };
          });
          return { ...w, nodes: [...updatedNodes, newNode] };
      }));
  }

  private getDownstreamNodes(nodes: WorkflowNode[], startId: string, excludeSourceId: string): Set<string> {
      const visited = new Set<string>();
      const queue = [startId];
      let safety = 0;
      while(queue.length > 0 && safety < 1000) {
          safety++;
          const id = queue.shift()!;
          if (visited.has(id) || id === excludeSourceId) continue;
          visited.add(id);
          const n = nodes.find(node => node.id === id);
          if (n) {
              n.connections.forEach(c => {
                  if (!visited.has(c)) queue.push(c);
              });
          }
      }
      return visited;
  }
  
  toggleBreakpoint(nodeId: string) {
      const activeId = this.activeWorkflowId();
      if (!activeId) return;
      this.workflows.update(list => list.map(w => w.id === activeId ? {
              ...w, nodes: w.nodes.map(n => n.id === nodeId ? { ...n, isBreakpoint: !n.isBreakpoint } : n)
          } : w));
  }

  // Execution (Debugging)
  startExecution() {
      const wf = this.activeWorkflow();
      if (!wf) return;
      const startNode = wf.nodes.find(n => n.type === 'start');
      if (!startNode) return;
      const vars: Record<string, any> = {};
      [...wf.inputs, ...wf.locals].forEach(p => vars[p.name] = undefined);
      this.execution.set({ status: 'running', currentNodeId: startNode.id, variables: vars, logs: [`Started workflow '${wf.name}'`] });
      this.processExecutionLoop();
  }

  stopExecution() {
      this.execution.set({ status: 'idle', currentNodeId: null, variables: {}, logs: [] });
  }

  resumeExecution() {
      this.execution.update(s => ({ ...s, status: 'running' }));
      this.processExecutionLoop();
  }

  stepExecution() {
      if (this.execution().status === 'idle') {
          this.startExecution();
          this.execution.update(s => ({ ...s, status: 'paused' }));
      } else {
          this.execution.update(s => ({ ...s, status: 'running' }));
          this.processExecutionLoop(true);
      }
  }

  private processExecutionLoop(singleStep = false) {
      setTimeout(() => {
          const state = this.execution();
          if (state.status !== 'running') return;
          const wf = this.activeWorkflow();
          if (!wf || !state.currentNodeId) {
              this.logExecution('Execution finished.');
              this.stopExecution();
              return;
          }
          const node = wf.nodes.find(n => n.id === state.currentNodeId);
          if (!node) {
              this.logExecution(`Error: Node ${state.currentNodeId} not found.`);
              this.stopExecution();
              return;
          }
          let nextNodeId: string | null = null;
          let newVars = { ...state.variables };
          let logMsg = '';
          try {
              switch(node.type) {
                  case 'start': nextNodeId = node.connections[0]; logMsg = 'Start'; break;
                  case 'assign': 
                      const target = node.config['targetVar']; const expr = node.config['expression'];
                      if (target) {
                          let val = expr;
                          if (!isNaN(Number(expr))) val = Number(expr);
                          else if (expr === 'true') val = true;
                          else if (expr === 'false') val = false;
                          else if (expr?.startsWith('"')) val = expr.replace(/"/g, '');
                          else if (newVars[expr] !== undefined) val = newVars[expr]; 
                          newVars[target] = val; logMsg = `Set ${target} = ${val}`;
                      }
                      nextNodeId = node.connections[0]; break;
                  case 'if':
                      const cond = node.config['expression'];
                      let result = false;
                      if (cond === 'true') result = true;
                      else if (newVars[cond]) result = true;
                      logMsg = `If (${cond}) -> ${result}`;
                      nextNodeId = result ? node.connections[0] : (node.connections[1] || node.connections[0]); break;
                  case 'action': logMsg = `Execute: ${node.config['query'] || 'Action'}`; nextNodeId = node.connections[0]; break;
                  case 'return': logMsg = 'Return'; nextNodeId = null; break;
                  default: nextNodeId = node.connections[0];
              }
          } catch (e) { logMsg = `Error: ${e}`; }
          this.execution.update(s => ({ ...s, currentNodeId: nextNodeId, variables: newVars, logs: [...s.logs, `[${new Date().toLocaleTimeString().split(' ')[0]}] ${logMsg}`].slice(-20) }));
          const nextNode = nextNodeId ? wf.nodes.find(n => n.id === nextNodeId) : null;
          if (singleStep || (nextNode && nextNode.isBreakpoint)) {
               this.execution.update(s => ({ ...s, status: 'paused' }));
               if (nextNode?.isBreakpoint) this.logExecution(`Breakpoint hit at ${nextNode.label}`);
          } else if (nextNodeId) {
               this.processExecutionLoop();
          } else {
               setTimeout(() => {
                  this.logExecution('Execution Completed.');
                  this.execution.update(s => ({ ...s, status: 'paused', currentNodeId: null }));
               }, 500);
          }
      }, 600);
  }

  private logExecution(msg: string) {
      this.execution.update(s => ({ ...s, logs: [...s.logs, msg].slice(-20) }));
  }
}
