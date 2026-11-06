import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { theme, setTheme, themes, activeThemeMeta } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        // Cycle to next theme
        const idx = themes.findIndex((t) => t.id === theme);
        const nextIdx = (idx + 1) % themes.length;
        setTheme(themes[nextIdx].id);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [theme, themes, setTheme]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Theme Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={`Current Theme: ${activeThemeMeta.name} (Click to switch, ⌘J to cycle)`}
        aria-label="Theme selector"
        className="h-8 px-2.5 rounded-md border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-2 transition-all duration-150"
      >
        <span
          className="size-2 rounded-full transition-transform duration-200"
          style={{ backgroundColor: activeThemeMeta.accent }}
        />
        <Palette className="size-3.5 text-zinc-500 dark:text-zinc-400" />
        <span className="hidden sm:inline text-zinc-700 dark:text-zinc-200 font-medium">
          {activeThemeMeta.name}
        </span>
      </button>

      {/* Floating Theme Switcher Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl p-2.5 bg-white/95 dark:bg-[#0E1118]/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/90 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Atmosphere &amp; Theme
              </span>
            </div>
            <kbd className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              ⌘J
            </kbd>
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-all duration-150 ${
                    isSelected
                      ? 'bg-zinc-100/90 dark:bg-zinc-800/80 ring-1 ring-zinc-300 dark:ring-zinc-700'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="size-3 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: t.accent }}
                      />
                      <span
                        className="size-2 rounded-full border border-black/10 opacity-75"
                        style={{ backgroundColor: t.accentSecondary }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {t.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {t.tagline}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check
                      className="size-4 shrink-0"
                      style={{ color: t.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;

