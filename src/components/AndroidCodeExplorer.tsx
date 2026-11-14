import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2, FolderTree, Search } from 'lucide-react';
import { ANDROID_SOURCE_FILES, AndroidSourceFile } from '../data/androidProjectFiles';

const LAYERS: AndroidSourceFile['layer'][] = [
  'Manifest & Gradle',
  'Data & Room',
  'Network & Security',
  'Workers & Utils',
  'Jetpack Compose UI',
];

export const AndroidCodeExplorer: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>(ANDROID_SOURCE_FILES[0].path);
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);

  const activeFile = useMemo(
    () => ANDROID_SOURCE_FILES.find((f) => f.path === selectedPath) || ANDROID_SOURCE_FILES[0],
    [selectedPath]
  );

  const filteredFiles = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return ANDROID_SOURCE_FILES;
    return ANDROID_SOURCE_FILES.filter(
      (f) =>
        f.path.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.layer.toLowerCase().includes(q)
    );
  }, [filterText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDownloadFile = () => {
    const filename = activeFile.path.split('/').pop() || 'Source.kt';
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-5 items-start">
      {/* Left Package Explorer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FolderTree className="w-4 h-4 text-emerald-700" />
            MVVM Android Project
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {ANDROID_SOURCE_FILES.length} files
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter Kotlin / Gradle files..."
            className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto thin-scrollbar pr-1">
          {LAYERS.map((layer) => {
            const filesInLayer = filteredFiles.filter((f) => f.layer === layer);
            if (filesInLayer.length === 0) return null;
            return (
              <div key={layer} className="space-y-1">
                <div className="px-2 text-[11px] font-semibold text-slate-500">{layer}</div>
                {filesInLayer.map((file) => {
                  const shortName = file.path.split('/').pop() || file.path;
                  const active = file.path === activeFile.path;
                  return (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelectedPath(file.path)}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center gap-2 text-xs transition-colors ${
                        active
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <FileCode2 className="w-3.5 h-3.5 shrink-0 opacity-75" />
                      <span className="truncate font-mono">{shortName}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Code Viewer */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden min-w-0">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-mono font-semibold text-slate-900 break-all">
              {activeFile.path}
            </div>
            <p className="text-xs text-slate-600">{activeFile.summary}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleDownloadFile}
              className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download File
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-950 text-slate-100 text-xs font-mono leading-relaxed overflow-x-auto max-h-[620px] thin-scrollbar">
          <code>{activeFile.code}</code>
        </pre>
      </div>
    </div>
  );
};
