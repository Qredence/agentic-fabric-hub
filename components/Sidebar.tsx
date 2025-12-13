import React from 'react';
import { NodeType } from '../types';
import { Settings, Cpu, Activity, GitBranch, Bot, Hammer, FileText, Square, Type, Blocks, Brain, Cloud } from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
  onAddTemplate: (templateId: string) => void;
  isDarkMode: boolean;
}

const TEMPLATES = [
  { id: 'af_orchestrator', label: 'AgentFramework Orchestrator', icon: Blocks, color: 'bg-brand-600' },
  { id: 'dspy_program', label: 'DSPy Program (spec+eval)', icon: Brain, color: 'bg-yellow-600' },
  { id: 'foundry_stack', label: 'Foundry Resources (zone)', icon: Cloud, color: 'bg-sky-600' },
];

const ITEMS = [
  { type: NodeType.CONFIG, label: 'Config', icon: Settings, color: 'bg-slate-600' },
  { type: NodeType.DSPY_MODULE, label: 'DSPy Module', icon: Cpu, color: 'bg-yellow-600' },
  { type: NodeType.PHASE, label: 'Pipeline Phase', icon: Activity, color: 'bg-blue-600' },
  { type: NodeType.STRATEGY, label: 'Strategy', icon: GitBranch, color: 'bg-purple-600' },
  { type: NodeType.AGENT, label: 'Agent', icon: Bot, color: 'bg-pink-600' },
  { type: NodeType.TOOL, label: 'Tool', icon: Hammer, color: 'bg-emerald-600' },
  { type: NodeType.TASK, label: 'Task', icon: FileText, color: 'bg-zinc-500' },
  { type: NodeType.SURFACE, label: 'Zone', icon: Square, color: 'bg-zinc-700' },
  { type: NodeType.ANNOTATION, label: 'Text', icon: Type, color: 'bg-zinc-200' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode, onAddTemplate, isDarkMode }) => {
  const containerClass = isDarkMode 
    ? 'bg-[#18181b] border-zinc-800' 
    : 'bg-white border-zinc-200 shadow-xl';
  
  const textClass = isDarkMode ? 'text-zinc-300' : 'text-zinc-700';
  const hoverClass = isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100';
  const labelHeaderClass = isDarkMode ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className={`${containerClass} border p-2 rounded-xl shadow-2xl flex flex-col gap-1 w-56 transition-all duration-300 overflow-hidden ease-out`}>
        <div className={`font-bold ${labelHeaderClass} text-[10px] uppercase mb-2 whitespace-nowrap pl-2 pt-1 tracking-wider`}>
            Agent Fleet
        </div>

        <div className={`text-[10px] font-bold ${labelHeaderClass} uppercase tracking-widest mb-1 pl-2`}>
          Templates
        </div>
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onAddTemplate(tpl.id)}
            className={`flex items-center gap-3 p-2 rounded-lg ${hoverClass} transition-colors group/btn`}
            title={tpl.label}
          >
            <div className={`p-1.5 rounded-md ${tpl.color} shadow-sm shrink-0`}>
              <tpl.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={`${textClass} text-sm font-medium whitespace-nowrap truncate`}>
              {tpl.label}
            </span>
          </button>
        ))}

        <div className={`h-px w-full my-2 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>

        <div className={`text-[10px] font-bold ${labelHeaderClass} uppercase tracking-widest mb-1 pl-2`}>
          Blocks
        </div>
        {ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddNode(item.type)}
            className={`flex items-center gap-3 p-2 rounded-lg ${hoverClass} transition-colors group/btn`}
            title={item.label}
          >
            <div className={`p-1.5 rounded-md ${item.color} shadow-sm shrink-0`}>
              <item.icon className={`w-3.5 h-3.5 ${item.type === NodeType.ANNOTATION ? 'text-zinc-900' : 'text-white'}`} />
            </div>
            <span className={`${textClass} text-sm font-medium whitespace-nowrap`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};