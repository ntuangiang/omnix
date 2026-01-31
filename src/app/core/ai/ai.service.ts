
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    // Ideally this comes from environment, but per instructions we use process.env.API_KEY
    // If process is undefined in browser shim, we handle it gracefully in the UI
    const apiKey = (window as any).process?.env?.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateUiStructure(prompt: string): Promise<any> {
    if (!this.ai) throw new Error('AI not initialized');

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a website layout structure for: "${prompt}". Return ONLY a JSON object with a "components" array. 
        Available component types: "hero", "features", "content", "cta", "footer", "pricing".
        Each component should have: "type" (string), "title" (string), "description" (string), "bg" (string: 'white' | 'gray').
        Keep text concise.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              components: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    bg: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      
      const text = response.text;
      return JSON.parse(text);
    } catch (e) {
      console.error('AI Generation Error', e);
      throw e;
    }
  }

  async generateWorkflow(prompt: string): Promise<any> {
    if (!this.ai) throw new Error('AI not initialized');

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a backend logic workflow for: "${prompt}". Return ONLY a JSON object with a "nodes" array.
        Available node types: "trigger" (API Endpoint), "action" (Database/Email), "logic" (If/Else).
        The nodes should represent a logical flow.
        Each node should have: "type", "label", "detail".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    label: { type: Type.STRING },
                    detail: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (e) {
      console.error('AI Generation Error', e);
      throw e;
    }
  }

  async analyzeCode(components: any[], nodes: any[]): Promise<string> {
     const prompt = `
     Analyze this project configuration and generate a summary of the architecture.
     
     UI Components: ${JSON.stringify(components.map(c => c.type))}
     Backend Workflow: ${JSON.stringify(nodes.map(n => n.label))}
     
     Provide a technical summary of the NestJS modules and Angular components that would be generated.
     `;

     const response = await this.ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: prompt
     });
     return response.text;
  }

  async suggestNodeBetween(sourceType: string, targetType: string): Promise<string> {
    if (!this.ai) return 'action'; // Fallback

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `I have a workflow node of type "${sourceType}" connected to a node of type "${targetType}". 
            I want to insert a step in between. Suggest the most likely node type from this list: "assign", "if", "switch", "foreach", "action".
            Return ONLY the string of the node type.`,
            config: {
                maxOutputTokens: 10
            }
        });
        const type = response.text.trim().toLowerCase();
        const validTypes = ['assign', 'if', 'switch', 'foreach', 'action'];
        return validTypes.includes(type) ? type : 'action';
    } catch (e) {
        console.warn('AI Suggestion failed', e);
        return 'action';
    }
  }
}
