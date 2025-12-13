import React, { useRef, useState } from 'react';
import { Wand2, Loader2, Download, Upload, Sun, Moon } from 'lucide-react';

interface ToolbarProps {
  onGenerate: (prompt: string) => Promise<void>;
  onExport: () => void;
  onImport: (file: File) => Promise<void> | void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onGenerate, onExport, onImport, isDarkMode, onToggleTheme }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      await onGenerate(prompt);
      setPrompt('');
      setExpanded(false);
    } catch (e) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const containerClass = isDarkMode 
    ? 'bg-[#18181b] border-zinc-800' 
    : 'bg-white border-zinc-200 shadow-xl';
  
  const textClass = isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900';
  const inputClass = isDarkMode 
    ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600' 
    : 'bg-slate-50 border-zinc-200 text-zinc-900 placeholder-zinc-400';
  const buttonHoverClass = isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100';
  const iconBgClass = isDarkMode ? 'bg-zinc-800 group-hover:bg-zinc-700' : 'bg-slate-100 group-hover:bg-slate-200';

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 w-full max-w-lg px-4 pointer-events-none">
      <div className={`${containerClass} border p-1.5 rounded-xl flex items-center gap-2 shadow-2xl w-full pointer-events-auto transition-all duration-300`}>
        {isExpanded ? (
          <div className="flex-1 flex gap-2 animate-in fade-in zoom-in duration-200">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Create a Coordinator agent delegating to a Research agent...'"
              className={`flex-1 ${inputClass} border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors`}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              autoFocus
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-brand-900/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Generate
            </button>
            <button 
              onClick={() => setExpanded(false)}
              className={`${textClass} px-2 text-sm font-medium transition-colors`}
            >
                Cancel
            </button>
          </div>
        ) : (
          <div className="flex w-full justify-between items-center px-1">
            <button
                onClick={() => setExpanded(true)}
                className={`flex items-center gap-2 text-sm ${textClass} ${buttonHoverClass} px-3 py-2 rounded-lg transition-all group`}
            >
                <div className={`p-1 rounded-md ${iconBgClass} transition-colors`}>
                   <Wand2 className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span>Magic Build</span>
            </button>
            
            <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await onImport(file);
                    } finally {
                      // Reset so selecting the same file again triggers onChange
                      e.target.value = '';
                    }
                  }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 text-sm ${textClass} ${buttonHoverClass} px-3 py-2 rounded-lg transition-all`}
                    title="Import JSON"
                >
                    <Upload className="w-4 h-4" />
                    <span>Import</span>
                </button>
                <button 
                    onClick={onExport}
                    className={`flex items-center gap-2 text-sm ${textClass} ${buttonHoverClass} px-3 py-2 rounded-lg transition-all`}
                >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                </button>
                <div className={`w-px h-4 mx-1 ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
                <button
                    onClick={onToggleTheme}
                    className={`p-2 rounded-lg transition-all ${textClass} ${buttonHoverClass}`}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};