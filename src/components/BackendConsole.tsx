import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Lock, Shield, Table2 } from 'lucide-react';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  GOOGLE_SHEETS_SCHEMA,
  LIVE_API_SECRET_KEY,
  LIVE_APPS_SCRIPT_URL,
} from '../data/appsScriptCode';

export const BackendConsole: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(GOOGLE_SHEETS_SCHEMA[0].tabName);
  const [viewMode, setViewMode] = useState<'SCHEMA' | 'APPS_SCRIPT'>('SCHEMA');
  const [copied, setCopied] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState<'URL' | 'KEY' | null>(null);

  const activeSchema =
    GOOGLE_SHEETS_SCHEMA.find((s) => s.tabName === selectedTab) || GOOGLE_SHEETS_SCHEMA[0];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleCopyField = async (type: 'URL' | 'KEY', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedConfig(type);
      setTimeout(() => setCopiedConfig(null), 1600);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleDownloadGs = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-base font-bold text-slate-900">
              Google Sheets Schema &amp; Secured Apps Script Web App
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The master Google Sheet remains strictly private to the Manager/Admin account. Telecallers authenticate via Phone + 4-digit PIN and communicate solely through the Apps Script Web App API guarded by <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">API_SECRET_KEY</code> and per-user session tokens.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('SCHEMA')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                viewMode === 'SCHEMA'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Tab Sheet Schema
            </button>
            <button
              type="button"
              onClick={() => setViewMode('APPS_SCRIPT')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                viewMode === 'APPS_SCRIPT'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google Apps Script (Code.gs)
            </button>
          </div>
        </div>

        {/* Live Configured Backend Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 pt-3 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-0">
            <span className="font-semibold text-slate-700 shrink-0">Web App URL:</span>
            <code className="font-mono text-emerald-800 truncate flex-1">
              {LIVE_APPS_SCRIPT_URL}
            </code>
            <button
              type="button"
              onClick={() => handleCopyField('URL', LIVE_APPS_SCRIPT_URL)}
              className="text-slate-600 hover:text-slate-900 font-semibold shrink-0 flex items-center gap-1"
            >
              {copiedConfig === 'URL' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedConfig === 'URL' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shrink-0">
            <span className="font-semibold text-slate-700">API Secret:</span>
            <code className="font-mono text-slate-900 font-semibold">{LIVE_API_SECRET_KEY}</code>
            <button
              type="button"
              onClick={() => handleCopyField('KEY', LIVE_API_SECRET_KEY)}
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              {copiedConfig === 'KEY' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedConfig === 'KEY' ? 'Copied' : 'Copy'}
            </button>
            <a
              href={LIVE_APPS_SCRIPT_URL}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 ml-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          </div>
        </div>
      </div>

      {viewMode === 'SCHEMA' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
          {/* Left Sheet Tab Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-500">
              Workbook Tabs (7)
            </div>
            {GOOGLE_SHEETS_SCHEMA.map((tab) => {
              const active = tab.tabName === selectedTab;
              return (
                <button
                  key={tab.tabName}
                  type="button"
                  onClick={() => setSelectedTab(tab.tabName)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Table2 className="w-3.5 h-3.5 shrink-0" />
                    {tab.tabName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {tab.columns.length} cols
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  {activeSchema.tabName}
                </h3>
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  {activeSchema.accessRule}
                </span>
              </div>
              <p className="text-xs text-slate-600">{activeSchema.purpose}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Column Header</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Example Value</th>
                    <th className="py-2.5 px-4 font-semibold">Enforcement / Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeSchema.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {col.name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{col.type}</td>
                      <td className="py-2.5 px-4 font-mono text-emerald-800 whitespace-nowrap">
                        {col.example}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{col.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* APPS SCRIPT CODE VIEWER */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span className="font-mono font-semibold text-slate-900">Code.gs</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">
                Deploy as Web App (Execute as: Me · Access: Anyone with API Key + Session Token)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code.gs'}
              </button>
              <button
                type="button"
                onClick={handleDownloadGs}
                className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Code.gs
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-100 text-xs font-mono leading-relaxed overflow-x-auto max-h-[620px] thin-scrollbar">
            <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
