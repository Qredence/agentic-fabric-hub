import { GoogleGenAI, Type } from "@google/genai";
import { NodeType, NodeData, Connection } from '../types';

export interface GeneratedNode {
  id: string;
  type: string;
  label: string;
  x: number;
  z: number;
  color?: string;
  metadata?: Record<string, string>;
  dimensions?: { width: number; depth: number };
  fontSize?: number;
}

export interface GeneratedConnection {
  id?: string;
  fromId: string;
  toId: string;
  label?: string;
  animated?: boolean;
}

export interface ArchitectureResponse {
  action: 'MERGE' | 'REPLACE';
  nodes: GeneratedNode[];
  connections: GeneratedConnection[];
}

export const generateArchitecture = async (
  prompt: string, 
  currentNodes: NodeData[] = [], 
  currentConnections: Connection[] = []
): Promise<ArchitectureResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Simplify context
  const contextNodes = currentNodes.map(n => ({ 
      id: n.id, 
      type: n.type, 
      label: n.label, 
      x: n.x, 
      z: n.z 
  }));
  const contextConnections = currentConnections.map(c => ({ 
    fromId: c.fromId, 
    toId: c.toId,
    label: c.label,
    animated: c.animated
  }));

  const systemInstruction = `You are a System Architect for an "Agentic Fleet" orchestration system. 
  You design workflows involving AI Agents, Tools, DSPy Modules, Execution Phases, and visually organize them.

  Current System State:
  ${JSON.stringify({ nodes: contextNodes, connections: contextConnections }, null, 2)}
  
  Node Types:
  1. CONFIG, DSPY_MODULE, PHASE, STRATEGY, AGENT, TOOL, TASK (Standard Blocks)
  2. SURFACE: A floor zone/area to group nodes. Needs dimensions (width, depth).
  3. ANNOTATION: 3D Text label on the board. Needs fontSize.

  Grid Rules: Unit 2. Keep x,z integer multiples of 2.
  Connections: Default to "animated": true to show active data flow.
  Response: JSON with action MERGE or REPLACE.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User Request: "${prompt}"`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, enum: ["MERGE", "REPLACE"] },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: Object.values(NodeType) },
                label: { type: Type.STRING },
                x: { type: Type.NUMBER },
                z: { type: Type.NUMBER },
                color: { type: Type.STRING },
                metadata: {
                  type: Type.OBJECT,
                  properties: {
                    model: { type: Type.STRING },
                    role: { type: Type.STRING },
                    category: { type: Type.STRING },
                    requiresApiKey: { type: Type.STRING },
                    executor: { type: Type.STRING },
                    status: { type: Type.STRING },
                  }, 
                },
                dimensions: {
                  type: Type.OBJECT,
                  properties: {
                    width: { type: Type.NUMBER },
                    depth: { type: Type.NUMBER }
                  }
                },
                fontSize: { type: Type.NUMBER }
              },
              required: ["id", "type", "label", "x", "z"]
            }
          },
          connections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                fromId: { type: Type.STRING },
                toId: { type: Type.STRING },
                label: { type: Type.STRING },
                animated: { type: Type.BOOLEAN }
              },
              required: ["fromId", "toId"]
            }
          }
        },
        required: ["action", "nodes", "connections"]
      }
    }
  });

  let jsonStr = response.text;
  if (!jsonStr) throw new Error("No response from AI");
  
  // Clean markdown code blocks if present to prevent parse errors
  jsonStr = jsonStr.trim().replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  
  try {
    return JSON.parse(jsonStr) as ArchitectureResponse;
  } catch (e) {
    console.error("Failed to parse JSON", jsonStr);
    throw new Error("Failed to parse AI response");
  }
};

export const generateNodeTexture = async (node: NodeData): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
  
    const ai = new GoogleGenAI({ apiKey });
  
    let prompt = "";
    const colorContext = `Primary Accent Color: ${node.color}.`;

    if (node.type === NodeType.SURFACE) {
        // Generate Tiling Texture
        prompt = `Design a seamless, tiling pattern texture for a floor zone.
        Style: Minimalist tech grid, data center floor, or hazard stripe area.
        ${colorContext}
        View: Top-down, flat, tiling.
        Mood: Professional, architectural, subtle.
        `;
    } else {
        // Generate Icon Badge
        let iconSubject = "abstract icon";
        switch(node.type) {
            case NodeType.AGENT: iconSubject = "robot head, AI face, or bot avatar"; break;
            case NodeType.DSPY_MODULE: iconSubject = "neural network node, brain, or math symbol"; break;
            case NodeType.PHASE: iconSubject = "progress circle, step icon, or stage flag"; break;
            case NodeType.STRATEGY: iconSubject = "branching paths, flowchart symbol, or diamond decision node"; break;
            case NodeType.TOOL: iconSubject = "database cylinder, wrench, gear, or API connection symbol"; break;
            case NodeType.TASK: iconSubject = "message envelope, file packet, or checkmark"; break;
            case NodeType.CONFIG: iconSubject = "settings slider, gear, or document file"; break;
        }

        prompt = `Design a flat, vector-style square icon.
        Subject: ${iconSubject} representing "${node.label}".
        Style: Minimalist, clean white vector lines on a solid background color (${node.color}) or transparent if possible.
        Details: High contrast, thick lines, readable at small scale. No isometric perspective, just a flat 2D icon.
        Purpose: To be placed on a small badge on top of a 3D block.
        `;
    }
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    
    throw new Error("No image generated");
};