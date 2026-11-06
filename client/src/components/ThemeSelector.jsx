import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, ChevronDown } from 'lucide-react';
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
      {/* Theme Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={`Current Theme: ${activeThemeMeta.name} (Click to switch, ⌘J to cycle)`}
        aria-label="Theme selector"
        className="h-8 pl-2.5 pr-3 rounded-full border border-[var(--border-app)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] shadow-sm text-xs font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer"
      >
        <div className="flex items-center -space-x-1">
          {themes.map((t) => (
            <span
              key={t.id}
              className={`size-2.5 rounded-full border border-black/15 transition-transform duration-200 ${
                t.id === theme
                  ? 'scale-125 z-10 ring-2 ring-[var(--accent-primary)]/40 shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: t.accent }}
            />
          ))}
        </div>
        <span className="text-[var(--text-main)] font-semibold text-xs tracking-tight hidden sm:inline">
          {activeThemeMeta.name}
        </span>
        <ChevronDown className="size-3 text-[var(--text-muted)] opacity-70" />
      </button>

      {/* Floating Theme Switcher Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl p-3 bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-app)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-[var(--accent-primary)]" />
              <span className="text-xs font-bold text-[var(--text-main)] tracking-tight">
                Aesthetic Atmosphere
              </span>
            </div>
            <kbd className="font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md font-semibold">
              ⌘J
            </kbd>
          </div>

          <div className="space-y-1.5">
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
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--sidebar-active-bg)] ring-1 ring-[var(--accent-primary)]/50 shadow-sm'
                      : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual Preview Swatch Block */}
                    <div
                      className="size-8 rounded-lg border border-black/15 shadow-inner flex items-center justify-center shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: t.bgPreview }}
                    >
                      <div
                        className="size-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: t.accent }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                          {t.name}
                        </p>
                        {isSelected && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider"
                            style={{
                              backgroundColor: t.accent + '22',
                              color: t.accent,
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
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
