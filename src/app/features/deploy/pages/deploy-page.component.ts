
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../../core/services/state.service';
import { AiService } from '../../../core/ai/ai.service';

@Component({
  selector: 'app-deploy-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full bg-slate-900 text-slate-300 font-mono p-8 overflow-y-auto">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-8 pb-8 border-b border-slate-700">
          <div>
            <h2 class="text-2xl text-white font-bold mb-2">System Compilation</h2>
            <p class="text-sm text-slate-400">Target: Docker Container (Node.js 20-alpine)</p>
          </div>
          <button (click)="startDeploy()" [disabled]="deploying()" class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 h-9 flex items-center rounded-md text-sm font-medium transition-colors">
            {{ deploying() ? 'Compiling...' : 'Build & Deploy' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <!-- Terminal Output -->
           <div class="bg-black rounded-lg p-6 shadow-2xl border border-slate-800 font-xs h-96 overflow-y-auto">
              <div class="flex gap-2 mb-4">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              @for (log of logs(); track log) {
                <div class="mb-1">
                  <span class="text-green-500">$</span> {{ log }}
                </div>
              }
              @if (deploying()) {
                <div class="animate-pulse text-blue-400">_</div>
              }
           </div>

           <!-- Architecture Summary -->
           <div class="space-y-6">
             <div class="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 class="text-white font-bold mb-4">Generated Manifest</h3>
                <div class="space-y-3 text-sm">
                   <div class="flex justify-between">
                     <span>Frontend</span>
                     <span class="text-green-400">Angular v20+</span>
                   </div>
                   <div class="flex justify-between">
                     <span>Backend</span>
                     <span class="text-green-400">NestJS v10</span>
                   </div>
                   <div class="flex justify-between">
                     <span>UI Components</span>
                     <span class="text-white">{{ state.uiComponents().length }} Units</span>
                   </div>
                   <div class="flex justify-between">
                     <span>Server Functions</span>
                     <span class="text-white">{{ serverCount }} Flows</span>
                   </div>
                </div>
             </div>

             @if (analysis()) {
               <div class="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 class="text-white font-bold mb-2">AI Architectural Analysis</h3>
                  <p class="text-sm leading-relaxed text-slate-300">{{ analysis() }}</p>
               </div>
             }
           </div>
        </div>
      </div>
    </div>
  `
})
export class DeployPageComponent {
  state = inject(StateService);
  ai = inject(AiService);
  
  deploying = signal(false);
  logs = signal<string[]>(['Ready to build.']);
  analysis = signal<string>('');

  get serverCount() {
      return this.state.workflows().filter(w => w.scope === 'server').length;
  }

  async startDeploy() {
    this.deploying.set(true);
    this.logs.set(['> Initializing build sequence...']);
    
    const steps = [
      'Parsing UI component tree...',
      'Generating Angular components...',
      'Compiling Tailwind CSS classes...',
      'Validating Server Workflow graph integrity...',
      'Transpiling NestJS modules...',
      'Building Docker image: nexus-app:latest...',
      'Pushing to registry...',
      'Deployment successful.'
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 800));
      this.logs.update(l => [...l, step]);
    }
    
    this.deploying.set(false);
    
    try {
      this.logs.update(l => [...l, '> Requesting AI Analysis...']);
      const workflowsSummary = this.state.workflows().map(w => ({ name: w.name, nodes: w.nodes.map(n => n.type) }));
      const text = await this.ai.analyzeCode(this.state.uiComponents(), workflowsSummary);
      this.analysis.set(text);
      this.logs.update(l => [...l, '> Analysis complete.']);
    } catch (e) {
      this.logs.update(l => [...l, '> AI Analysis failed.']);
    }
  }
}
