import React, { useState } from 'react';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Compass,
  Zap,
  Search,
  Shield,
  Layers,
} from 'lucide-react';

const ArchitecturePage = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-[#FAFAFA] dark:bg-[#09090B]' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold uppercase tracking-wider">
              Live Showcase
            </span>
            <span className="text-xs text-zinc-500">Archify Interactive Runtime</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
            System Architecture & Live Flow
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Interactive, verified architecture diagram featuring particle trace animation, guided viewpoints, node exploration, and cryptographic audit flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/architecture.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Standalone</span>
          </a>
          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 transition-opacity"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Feature Highlights */}
      {!isFullscreen && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="enterprise-card p-3 flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Live Particle Trace</p>
              <p className="text-[11px] text-zinc-500">Animated signal flow along connections</p>
            </div>
          </div>

          <div className="enterprise-card p-3 flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Guided Viewpoints</p>
              <p className="text-[11px] text-zinc-500">Overview, Audit Chain, and Security views</p>
            </div>
          </div>

          <div className="enterprise-card p-3 flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Node Finder & Lens</p>
              <p className="text-[11px] text-zinc-500">Search components, press / or click any box</p>
            </div>
          </div>

          <div className="enterprise-card p-3 flex items-start gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Semantic Passport</p>
              <p className="text-[11px] text-zinc-500">Upstream/downstream repository evidence</p>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Interactive Viewer Frame */}
      <div className={`enterprise-card overflow-hidden border border-zinc-200 dark:border-zinc-800 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[720px]'}`}>
        <iframe
          src="/architecture.html"
          title="ConsentLog Interactive Architecture"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ArchitecturePage;

