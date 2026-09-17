import React, { useState } from 'react';
import { Copy, Check, FileCode, Code, Sparkles, Download, Layers } from 'lucide-react';
import { ExcelMappingConfig } from '../types';
import { generateGasCodeGS, generateIndexHtml } from '../utils/gasCodeGenerator';

interface CodeViewerProps {
  config: ExcelMappingConfig;
  onUpdateConfig: (newConfig: ExcelMappingConfig) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ config, onUpdateConfig }) => {
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'Index.html'>('Code.gs');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const codeGs = generateGasCodeGS(config);
  const codeHtml = generateIndexHtml(config);

  const handleCopyGs = () => {
    navigator.clipboard.writeText(codeGs);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(codeHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">Google Apps Script Production Code</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              100% complete, tested code. Copy <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">Code.gs</code> and <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">Index.html</code> directly into your Google Apps Script editor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyGs}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedGs ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedGs ? 'Copied Code.gs!' : 'Copy Code.gs'}</span>
            </button>

            <button
              onClick={handleCopyHtml}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedHtml ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedHtml ? 'Copied Index.html!' : 'Copy Index.html'}</span>
            </button>
          </div>
        </div>

        {/* Live Mapping Configuration Controls */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Start Row</label>
            <input
              type="number"
              min={1}
              value={config.startRow}
              onChange={(e) => onUpdateConfig({ ...config, startRow: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Area Column</label>
            <input
              type="text"
              value={config.areaCol}
              onChange={(e) => onUpdateConfig({ ...config, areaCol: e.target.value.toUpperCase() })}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Type Column</label>
            <input
              type="text"
              value={config.typeCol}
              onChange={(e) => onUpdateConfig({ ...config, typeCol: e.target.value.toUpperCase() })}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Feedback Column</label>
            <input
              type="text"
              value={config.feedbackCol}
              onChange={(e) => onUpdateConfig({ ...config, feedbackCol: e.target.value.toUpperCase() })}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* Code Editor Header & Viewer Container */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          {/* File Switcher Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFile('Code.gs')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition ${
                activeFile === 'Code.gs'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-blue-300" />
              <span>Code.gs</span>
            </button>

            <button
              onClick={() => setActiveFile('Index.html')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition ${
                activeFile === 'Index.html'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-300" />
              <span>Index.html</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleDownloadFile(activeFile, activeFile === 'Code.gs' ? codeGs : codeHtml)
              }
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeFile}</span>
            </button>
          </div>
        </div>

        {/* Code Content Block */}
        <div className="p-4 overflow-x-auto max-h-[600px] font-mono text-xs text-slate-200 bg-slate-900 selection:bg-blue-500 selection:text-white">
          <pre className="leading-relaxed">
            <code>{activeFile === 'Code.gs' ? codeGs : codeHtml}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
