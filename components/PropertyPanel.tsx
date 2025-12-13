import React, { useState } from 'react';
import { NodeData, NodeType, Connection } from '../types';
import { 
  Trash2, Link as LinkIcon, X, Plus, Activity, Tag, 
  Bot, Hammer, PlayCircle, Image as ImageIcon, Loader2, 
  Wand2, ChevronDown, Key, Terminal, Type, Scaling,
  Settings, Cpu, GitBranch, FileText, Square, Layers
} from 'lucide-react';
import { generateNodeTexture } from '../services/geminiService';

interface PropertyPanelProps {
  node: NodeData | null;
  nodes: NodeData[];
  connections: Connection[];
  selectedIds: Set<string>;
  onGroupNodes: () => void;
  onChange: (id: string, data: Partial<NodeData>) => void;
  onDelete: (id: string) => void;
  onAddConnection: (fromId: string, toId: string) => void;
  onRemoveConnection: (id: string) => void;
  onUpdateConnection: (id: string, data: Partial<Connection>) => void;
  isDarkMode: boolean;
}

// --- Theme Helper Hooks or Props can be used, but we'll pass classes ---

const HeroInput = ({ label, value, onChange, placeholder, icon: Icon, className = '', type = 'text', themeClasses }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className={`text-[10px] uppercase tracking-wider font-semibold ml-1 ${themeClasses.label}`}>{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-brand-500 transition-colors pointer-events-none ${themeClasses.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${themeClasses.input} rounded-xl py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
      />
    </div>
  </div>
);

const HeroTextarea = ({ label, value, onChange, placeholder, themeClasses }: any) => (
  <div className="space-y-1.5">
    {label && <label className={`text-[10px] uppercase tracking-wider font-semibold ml-1 ${themeClasses.label}`}>{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className={`w-full ${themeClasses.input} rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none`}
    />
  </div>
);

const HeroSelect = ({ label, value, onChange, options, icon: Icon, themeClasses }: any) => (
  <div className="space-y-1.5">
    {label && <label className={`text-[10px] uppercase tracking-wider font-semibold ml-1 ${themeClasses.label}`}>{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-brand-500 transition-colors pointer-events-none ${themeClasses.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full ${themeClasses.input} rounded-xl py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none cursor-pointer ${Icon ? 'pl-9 pr-8' : 'px-3 pr-8'}`}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} className={themeClasses.option}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-zinc-400 ${themeClasses.icon}`}>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  </div>
);

const HeroSwitch = ({ label, checked, onChange, icon: Icon, themeClasses }: any) => (
  <label className={`flex items-center justify-between p-3 rounded-xl border border-transparent cursor-pointer transition-all group select-none ${themeClasses.switchBg}`}>
    <div className="flex items-center gap-2">
       {Icon && <Icon className={`w-4 h-4 group-hover:text-zinc-400 ${themeClasses.icon}`} />}
       <span className={`text-xs font-medium ${themeClasses.text}`}>{label}</span>
    </div>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${checked ? 'bg-brand-600' : 'bg-zinc-500/50'}`}></div>
      <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  </label>
);

// --- Main Component ---

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  node, 
  nodes, 
  connections,
  selectedIds,
  onGroupNodes,
  onChange, 
  onDelete,
  onAddConnection,
  onRemoveConnection,
  onUpdateConnection,
  isDarkMode
}) => {
  const [generatingVisual, setGeneratingVisual] = useState(false);

  // Theme Classes
  const themeClasses = {
      container: isDarkMode ? 'bg-[#09090b] border-zinc-800/80 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl',
      textMain: isDarkMode ? 'text-zinc-100' : 'text-zinc-900',
      textSub: isDarkMode ? 'text-zinc-400' : 'text-zinc-500',
      label: isDarkMode ? 'text-zinc-500' : 'text-zinc-500',
      input: isDarkMode 
        ? 'bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 placeholder:text-zinc-600' 
        : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-900 placeholder:text-zinc-400',
      icon: isDarkMode ? 'text-zinc-500' : 'text-zinc-400',
      divider: isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-200',
      option: isDarkMode ? 'bg-zinc-900 text-zinc-200' : 'bg-white text-zinc-900',
      switchBg: isDarkMode ? 'bg-zinc-900/30 hover:bg-zinc-900/50' : 'bg-zinc-100/50 hover:bg-zinc-100',
      text: isDarkMode ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-800',
      card: isDarkMode ? 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
  };

  // --- Multi-Selection View ---
  if (selectedIds.size > 1) {
    const selectedList = nodes.filter(n => selectedIds.has(n.id));
    
    return (
        <div className={`absolute top-4 right-4 z-20 w-[300px] ${themeClasses.container} border rounded-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-right duration-500 font-sans`}>
             <div className="flex justify-between items-center">
                 <div>
                    <h2 className={`${themeClasses.textMain} font-bold text-lg`}>Selection</h2>
                    <p className={`text-xs ${themeClasses.textSub}`}>{selectedIds.size} items selected</p>
                 </div>
                 <button 
                    onClick={() => Array.from(selectedIds).forEach(id => onDelete(id))}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                    title="Delete All"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
             </div>
             
             <div className={`h-px ${themeClasses.divider} w-full`}></div>

             <button 
                onClick={onGroupNodes}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all shadow-sm group ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}
             >
                <Layers className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
                <span>Group Selected</span>
             </button>
             
             <div className="flex flex-col gap-2 mt-2">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Items</span>
                 <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                     {selectedList.map(n => (
                         <div key={n.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                             <div className="w-2 h-2 rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: n.color, color: n.color }}></div>
                             <span className={`${themeClasses.textSub} truncate`}>{n.label}</span>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
  }

  // --- Single Node View ---
  if (!node) return null;

  const relatedConnections = connections.filter(c => c.fromId === node.id || c.toId === node.id);
  const potentialTargets = nodes.filter(n => n.id !== node.id && !connections.some(c => (c.fromId === node.id && c.toId === n.id) || (c.fromId === n.id && c.toId === node.id)));

  const updateMetadata = (key: string, value: string) => {
    const newMeta = { ...(node.metadata || {}), [key]: value };
    onChange(node.id, { metadata: newMeta });
  };

  const handleDeleteMetadata = (key: string) => {
    const newMeta = { ...(node.metadata || {}) };
    delete newMeta[key];
    onChange(node.id, { metadata: newMeta });
  };

  const handleAddMetadata = () => {
    const newMeta = { ...(node.metadata || {}), 'new_prop': '' };
    onChange(node.id, { metadata: newMeta });
  };

  const handleGenerateVisual = async () => {
    setGeneratingVisual(true);
    try {
        const textureUrl = await generateNodeTexture(node);
        onChange(node.id, { textureUrl });
    } catch (e) {
        console.error("Failed to generate visual", e);
        alert("Failed to generate 3D texture. See console for details.");
    } finally {
        setGeneratingVisual(false);
    }
  };

  const SPECIAL_KEYS = new Set([
    'model', 'role', 'systemPrompt', 
    'category', 'requiresApiKey',    
    'executor', 'status',
    'path', 'format',
    'signature', 'optimizer',
    'strategyType',
    'priority', 'assignee'
  ]);

  const renderTypeSpecificFields = () => {
    switch (node.type) {
        case NodeType.SURFACE:
             return (
                 <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-zinc-500/10' : 'bg-zinc-100'}`}>
                            <Scaling className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dimensions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <HeroInput 
                            label="Width"
                            value={node.dimensions?.width || 4}
                            onChange={(e: any) => onChange(node.id, { dimensions: { ...node.dimensions, width: Number(e.target.value) || 4 } as any })}
                            type="number"
                            themeClasses={themeClasses}
                         />
                         <HeroInput 
                            label="Depth"
                            value={node.dimensions?.depth || 4}
                            onChange={(e: any) => onChange(node.id, { dimensions: { ...node.dimensions, depth: Number(e.target.value) || 4 } as any })}
                            type="number"
                            themeClasses={themeClasses}
                         />
                    </div>
                 </div>
             );
        case NodeType.ANNOTATION:
              return (
                 <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-zinc-500/10' : 'bg-zinc-100'}`}>
                            <Type className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Typography</span>
                    </div>
                    <HeroInput 
                        label="Font Size"
                        value={node.fontSize || 1}
                        onChange={(e: any) => onChange(node.id, { fontSize: Number(e.target.value) || 1 })}
                        type="number"
                        placeholder="1.0"
                        themeClasses={themeClasses}
                    />
                 </div>
              );
        case NodeType.AGENT:
            return (
                <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-pink-500/10' : 'bg-pink-50'}`}>
                            <Bot className="w-3.5 h-3.5 text-pink-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Agent Details</span>
                     </div>
                     <HeroInput 
                        label="Model"
                        value={node.metadata?.model || ''}
                        onChange={(e: any) => updateMetadata('model', e.target.value)}
                        placeholder="e.g. gpt-4-turbo"
                        icon={Terminal}
                        themeClasses={themeClasses}
                     />
                     <HeroTextarea
                        label="Role Description"
                        value={node.metadata?.role || ''}
                        onChange={(e: any) => updateMetadata('role', e.target.value)}
                        placeholder="Describe the agent's core responsibilities..."
                        themeClasses={themeClasses}
                     />
                     <HeroTextarea
                        label="System Prompt"
                        value={node.metadata?.systemPrompt || ''}
                        onChange={(e: any) => updateMetadata('systemPrompt', e.target.value)}
                        placeholder="You are a helpful AI assistant..."
                        themeClasses={themeClasses}
                     />
                </div>
            );
        case NodeType.TOOL:
             return (
                <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                            <Hammer className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tool Config</span>
                    </div>
                    <HeroSelect
                        label="Category"
                        value={node.metadata?.category || 'search'}
                        onChange={(e: any) => updateMetadata('category', e.target.value)}
                        icon={Tag}
                        themeClasses={themeClasses}
                        options={[
                            { value: 'search', label: 'Search Provider' },
                            { value: 'browser', label: 'Web Browser' },
                            { value: 'mcp', label: 'MCP Protocol' },
                            { value: 'code', label: 'Code Execution' },
                            { value: 'file', label: 'File System' },
                            { value: 'custom', label: 'Custom Integration' }
                        ]}
                    />
                    <HeroSwitch 
                        label="Requires API Key"
                        checked={node.metadata?.requiresApiKey === 'true'}
                        onChange={(e: any) => updateMetadata('requiresApiKey', String(e.target.checked))}
                        icon={Key}
                        themeClasses={themeClasses}
                    />
                </div>
             );
        case NodeType.PHASE:
            return (
                 <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                            <PlayCircle className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Execution State</span>
                     </div>
                     <HeroInput
                         label="Executor Class"
                         value={node.metadata?.executor || ''}
                         onChange={(e: any) => updateMetadata('executor', e.target.value)}
                         placeholder="e.g. AnalysisExecutor"
                         icon={Terminal}
                         themeClasses={themeClasses}
                     />
                     <HeroSelect
                        label="Current Status"
                        value={node.metadata?.status || 'pending'}
                        onChange={(e: any) => updateMetadata('status', e.target.value)}
                        icon={Activity}
                        themeClasses={themeClasses}
                        options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'running', label: 'Running' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'failed', label: 'Failed' }
                        ]}
                     />
                 </div>
            );
        case NodeType.CONFIG:
             return (
                 <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-slate-500/10' : 'bg-slate-100'}`}>
                            <Settings className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Configuration</span>
                     </div>
                     <HeroInput 
                        label="File Path"
                        value={node.metadata?.path || ''}
                        onChange={(e: any) => updateMetadata('path', e.target.value)}
                        placeholder="src/config/config.yaml"
                        icon={FileText}
                        themeClasses={themeClasses}
                     />
                     <HeroSelect
                        label="Format"
                        value={node.metadata?.format || 'yaml'}
                        onChange={(e: any) => updateMetadata('format', e.target.value)}
                        themeClasses={themeClasses}
                        options={[
                            { value: 'yaml', label: 'YAML' },
                            { value: 'json', label: 'JSON' },
                            { value: 'env', label: '.ENV' },
                            { value: 'toml', label: 'TOML' }
                        ]}
                     />
                 </div>
             );
        case NodeType.DSPY_MODULE:
             return (
                 <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                            <Cpu className="w-3.5 h-3.5 text-yellow-600" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">DSPy Module</span>
                     </div>
                     <HeroInput 
                        label="Signature"
                        value={node.metadata?.signature || ''}
                        onChange={(e: any) => updateMetadata('signature', e.target.value)}
                        placeholder="question -> answer"
                        icon={Terminal}
                        themeClasses={themeClasses}
                     />
                     <HeroSelect
                        label="Optimizer"
                        value={node.metadata?.optimizer || 'BootstrapFewShot'}
                        onChange={(e: any) => updateMetadata('optimizer', e.target.value)}
                        themeClasses={themeClasses}
                        options={[
                            { value: 'BootstrapFewShot', label: 'BootstrapFewShot' },
                            { value: 'COPRO', label: 'COPRO' },
                            { value: 'MIPRO', label: 'MIPRO' },
                            { value: 'KNN', label: 'KNN' }
                        ]}
                     />
                 </div>
             );
        case NodeType.STRATEGY:
             return (
                 <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                            <GitBranch className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reasoning Strategy</span>
                     </div>
                     <HeroSelect
                        label="Pattern"
                        value={node.metadata?.strategyType || 'ReAct'}
                        onChange={(e: any) => updateMetadata('strategyType', e.target.value)}
                        themeClasses={themeClasses}
                        options={[
                            { value: 'ReAct', label: 'ReAct' },
                            { value: 'ChainOfThought', label: 'Chain of Thought' },
                            { value: 'TreeOfThoughts', label: 'Tree of Thoughts' },
                            { value: 'PlanAndSolve', label: 'Plan & Solve' },
                            { value: 'Reflexion', label: 'Reflexion' }
                        ]}
                     />
                 </div>
             );
        case NodeType.TASK:
             return (
                 <div className="space-y-4 mb-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-md ${isDarkMode ? 'bg-zinc-500/10' : 'bg-zinc-100'}`}>
                            <FileText className="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Task Definition</span>
                     </div>
                     <HeroSelect
                        label="Priority"
                        value={node.metadata?.priority || 'Medium'}
                        onChange={(e: any) => updateMetadata('priority', e.target.value)}
                        themeClasses={themeClasses}
                        options={[
                            { value: 'High', label: 'High' },
                            { value: 'Medium', label: 'Medium' },
                            { value: 'Low', label: 'Low' }
                        ]}
                     />
                     <HeroInput 
                        label="Assignee"
                        value={node.metadata?.assignee || ''}
                        onChange={(e: any) => updateMetadata('assignee', e.target.value)}
                        placeholder="Agent or User ID"
                        icon={Bot}
                        themeClasses={themeClasses}
                     />
                 </div>
             );
        default:
            return null;
    }
  };

  return (
    <div className={`absolute top-4 right-4 z-20 w-[360px] ${themeClasses.container} border rounded-2xl flex flex-col max-h-[calc(100vh-32px)] overflow-hidden animate-in slide-in-from-right duration-500 font-sans transition-colors`}>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
                <h2 className={`${themeClasses.textMain} font-bold text-xl leading-none tracking-tight`}>{node.label}</h2>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-100 border-zinc-200'} border text-[10px] font-bold text-zinc-400 uppercase tracking-wider`}>
                    {node.type}
                </div>
            </div>
            <button 
                onClick={() => onDelete(node.id)}
                className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                title="Delete Node"
            >
                <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Visual Generator - Hidden for Annotation */}
          {node.type !== NodeType.ANNOTATION && (
            <div className="grid grid-cols-[88px_1fr] gap-3">
                <div className={`${isDarkMode ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border rounded-2xl flex items-center justify-center h-22 overflow-hidden relative group`}>
                    {node.textureUrl ? (
                        <img src={node.textureUrl} alt="Visual" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="flex flex-col items-center gap-1.5 text-zinc-600">
                            <ImageIcon className="w-5 h-5 opacity-50" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDBMMCAxME0wIDBMMTAgMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiAvPjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>
                </div>
                <button 
                    onClick={handleGenerateVisual} 
                    disabled={generatingVisual}
                    className={`h-22 ${themeClasses.card} border rounded-2xl flex flex-col items-center justify-center gap-2 text-xs font-medium ${themeClasses.textSub} transition-all disabled:opacity-50 group relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {generatingVisual ? (
                        <Loader2 className="w-5 h-5 text-brand-500 animate-spin relative z-10" />
                    ) : (
                        <Wand2 className={`w-5 h-5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} group-hover:text-brand-400 transition-colors relative z-10`} />
                    )}
                    <span className="relative z-10">{node.textureUrl ? 'Regenerate Visual' : 'Generate 3D Visual'}</span>
                </button>
            </div>
          )}

          {/* Core Properties */}
          <div className="space-y-4">
            <HeroInput 
                label="Label Name"
                value={node.label}
                onChange={(e: any) => onChange(node.id, { label: e.target.value })}
                themeClasses={themeClasses}
            />
            
            <div className="grid grid-cols-[1fr_1.2fr] gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold ml-1">Color</label>
                    <div className={`flex items-center gap-2 ${themeClasses.input} rounded-xl px-2 py-2.5 relative overflow-hidden transition-colors group`}>
                        <div className="w-5 h-5 rounded-md shadow-sm shrink-0 border border-zinc-700/50" style={{ backgroundColor: node.color }}></div>
                        <input 
                            type="text" 
                            value={node.color}
                            onChange={(e) => onChange(node.id, { color: e.target.value })}
                            className={`bg-transparent text-xs w-full ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'} focus:outline-none font-mono uppercase`}
                        />
                        <input 
                            type="color" 
                            value={node.color}
                            onChange={(e) => onChange(node.id, { color: e.target.value })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold ml-1">Position (X, Z)</label>
                   <div className="flex gap-2">
                       <input
                           type="number"
                           value={node.x}
                           onChange={(e) => onChange(node.id, { x: parseInt(e.target.value) || 0 })}
                           className={`w-full ${themeClasses.input} rounded-xl px-2 py-2.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all`}
                       />
                        <input
                           type="number"
                           value={node.z}
                           onChange={(e) => onChange(node.id, { z: parseInt(e.target.value) || 0 })}
                           className={`w-full ${themeClasses.input} rounded-xl px-2 py-2.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all`}
                       />
                   </div>
                </div>
            </div>
          </div>

          <div className={`h-px ${themeClasses.divider} w-full`}></div>

          {/* Type Specific Fields */}
          {renderTypeSpecificFields()}

          {/* Generic Metadata */}
          <div>
            <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Additional Metadata</span>
                 <button onClick={handleAddMetadata} className="text-[10px] font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-md bg-brand-500/10 hover:bg-brand-500/20">
                    <Plus className="w-3 h-3" /> Add
                 </button>
            </div>
            <div className="space-y-2">
                {node.metadata && Object.entries(node.metadata)
                    .filter(([key]) => !SPECIAL_KEYS.has(key))
                    .map(([key, value]) => (
                    <div key={key} className="flex gap-2 items-center group animate-in slide-in-from-left-2 duration-300">
                        <input 
                            className={`flex-1 min-w-0 ${isDarkMode ? 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'} border text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} px-3 py-2 rounded-lg focus:text-brand-500 focus:outline-none focus:border-brand-500/50 transition-all`}
                            value={key}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                const val = node.metadata![key];
                                const newMeta = { ...(node.metadata || {}) };
                                delete newMeta[key];
                                newMeta[newVal] = val;
                                onChange(node.id, { metadata: newMeta });
                            }}
                        />
                        <div className="text-zinc-400">:</div>
                        <input 
                            className={`flex-[1.5] min-w-0 ${themeClasses.input} text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-brand-500/50 transition-all`}
                            value={value}
                            onChange={(e) => updateMetadata(key, e.target.value)}
                        />
                        <button onClick={() => handleDeleteMetadata(key)} className="text-zinc-400 hover:text-red-400 p-1.5 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-zinc-800">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                 {(!node.metadata || Object.keys(node.metadata).filter(k => !SPECIAL_KEYS.has(k)).length === 0) && (
                    <div className={`text-xs text-zinc-500 italic py-4 text-center border border-dashed ${isDarkMode ? 'border-zinc-800/50 bg-zinc-900/20' : 'border-zinc-200 bg-zinc-50'} rounded-xl`}>No additional metadata</div>
                )}
            </div>
          </div>

          <div className={`h-px ${themeClasses.divider} w-full`}></div>

          {/* Connections - Hidden for Surfaces/Annotations */}
          {node.type !== NodeType.SURFACE && node.type !== NodeType.ANNOTATION && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                    <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Connections</span>
                </div>
                
                <div className="space-y-2 mb-4">
                    {relatedConnections.map(conn => {
                        const isSource = conn.fromId === node.id;
                        const otherNode = nodes.find(n => n.id === (isSource ? conn.toId : conn.fromId));
                        return (
                            <div key={conn.id} className={`${themeClasses.card} border rounded-xl p-2.5 group transition-colors`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                    <div className={`text-[9px] uppercase px-1.5 py-0.5 rounded-[4px] font-bold tracking-wider ${isSource ? 'bg-brand-500/10 text-brand-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {isSource ? 'OUT' : 'IN'}
                                    </div>
                                    <span className={`text-xs ${themeClasses.textMain} truncate font-medium`}>{otherNode?.label || 'Unknown'}</span>
                                    </div>
                                    <button onClick={() => onRemoveConnection(conn.id)} className="text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                
                                <div className="flex gap-2 items-center">
                                    <div className="flex items-center gap-1.5 shrink-0" title="Toggle Data Flow Animation">
                                        <Activity className={`w-3.5 h-3.5 ${conn.animated ? 'text-brand-400' : 'text-zinc-600'}`} />
                                        <label className="relative cursor-pointer shrink-0">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={conn.animated ?? true} 
                                                onChange={(e) => onUpdateConnection(conn.id, { animated: e.target.checked })} 
                                            />
                                            {/* Compact Toggle Switch for List Item */}
                                            <div className={`w-8 h-4.5 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${conn.animated ? 'bg-brand-600' : 'bg-zinc-500/30'}`}></div>
                                            <div className={`absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${conn.animated ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                                        </label>
                                    </div>

                                    <div className={`flex items-center flex-1 ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'} rounded-lg border ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'} px-2.5 py-1.5 focus-within:border-zinc-500 transition-all`}>
                                        <Tag className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
                                        <input 
                                            className={`bg-transparent text-[10px] ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'} w-full focus:outline-none placeholder-zinc-500`}
                                            placeholder="Label..."
                                            value={conn.label || ''}
                                            onChange={(e) => onUpdateConnection(conn.id, { label: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {relatedConnections.length === 0 && (
                        <div className={`text-xs text-zinc-500 italic py-4 text-center border border-dashed ${isDarkMode ? 'border-zinc-800/50 bg-zinc-900/20' : 'border-zinc-200 bg-zinc-50'} rounded-xl`}>No connections</div>
                    )}
                </div>

                <div className="relative group">
                    <select 
                        className={`w-full ${themeClasses.input} rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer transition-all`}
                        onChange={(e) => {
                            if (e.target.value) {
                                onAddConnection(node.id, e.target.value);
                                e.target.value = ''; 
                            }
                        }}
                    >
                        <option value="">+ Connect to Node...</option>
                        {potentialTargets.map(t => (
                            <option key={t.id} value={t.id} className={themeClasses.option}>{t.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
              </div>
          )}
      </div>
      
      {/* Footer Fade */}
      <div className={`h-6 w-full pointer-events-none absolute bottom-0 bg-gradient-to-t ${isDarkMode ? 'from-[#09090b]' : 'from-white'} to-transparent`}></div>
    </div>
  );
}