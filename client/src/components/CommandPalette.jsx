import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sliders,
  History,
  FileText,
  GitCompare,
  ShieldCheck,
  Users,
  Lock,
  LayoutDashboard,
  Sun,
  Moon,
  Download,
  CornerDownLeft,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const CommandPalette = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const exportDsarBundle = async () => {
    try {
      const res = await api.get('/audit/dsar-passport');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ConsentLog-DSAR-Passport-${user?.email || 'user'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(
        `Downloaded SHA-256 signed DSAR Privacy Passport (${res.data.passportSignature.slice(0, 12)}...)`,
        'success',
        'GDPR Art. 15 & 20 Export'
      );
    } catch (err) {
      addToast('Failed to generate DSAR Privacy Passport.', 'error');
    }
  };

  const runQuickChainCheck = async () => {
    try {
      const res = await api.post('/audit/verify');
      addToast(res.data.message, 'success', 'SHA-256 Ledger Verified');
    } catch {
      addToast('Verification failed.', 'error');
    }
  };

  const actions = [
    {
      id: 'nav-dashboard',
      title: 'Go to Enterprise Telemetry Overview',
      category: 'Navigation',
      shortcut: 'G D',
      icon: LayoutDashboard,
      perform: () => navigate('/dashboard'),
    },
    {
      id: 'nav-prefs',
      title: 'Open Interactive Preference Centre',
      category: 'Navigation',
      shortcut: 'G P',
      icon: Sliders,
      perform: () => navigate('/preferences'),
    },
    {
      id: 'nav-audit',
      title: 'Inspect Append-Only SHA-256 Audit Ledger',
      category: 'Navigation',
      shortcut: 'G A',
      icon: History,
      perform: () => navigate('/audit-history'),
    },
    {
      id: 'nav-notices',
      title: 'Browse Versioned Privacy Notice Repository',
      category: 'Navigation',
      shortcut: 'G N',
      icon: FileText,
      perform: () => navigate('/notices'),
    },
    {
      id: 'nav-diff',
      title: 'Compare Privacy Notice Versions (v1.0 ↔ v2.0 Diff)',
      category: 'Navigation',
      shortcut: 'G C',
      icon: GitCompare,
      perform: () => navigate('/notices/compare'),
    },
    {
      id: 'act-verify',
      title: 'Execute Live SHA-256 Cryptographic Chain Verification',
      category: 'Cryptographic Operations',
      shortcut: '⌘ V',
      icon: Lock,
      perform: runQuickChainCheck,
    },
    {
      id: 'act-dsar',
      title: 'Download Signed DSAR Privacy Passport (JSON Bundle)',
      category: 'Compliance Export',
      shortcut: '⌘ E',
      icon: Download,
      perform: exportDsarBundle,
    },
    {
      id: 'act-theme',
      title: `Switch Interface Theme to ${darkMode ? 'Light' : 'Dark'} Mode`,
      category: 'Workspace',
      shortcut: '⌘ J',
      icon: darkMode ? Sun : Moon,
      perform: toggleTheme,
    },
  ];

  if (user?.role === 'admin') {
    actions.push(
      {
        id: 'admin-cmd',
        title: 'Admin: Open CPO Governance Command Centre',
        category: 'Administration',
        shortcut: 'A D',
        icon: ShieldCheck,
        perform: () => navigate('/admin'),
      },
      {
        id: 'admin-users',
        title: 'Admin: Inspect User Consent Directory',
        category: 'Administration',
        shortcut: 'A U',
        icon: Users,
        perform: () => navigate('/admin/users'),
      },
      {
        id: 'admin-tamper',
        title: 'Admin: Launch SHA-256 Tamper Attack Simulator',
        category: 'Administration',
        shortcut: 'A T',
        icon: Terminal,
        perform: () => navigate('/admin/integrity'),
      }
    );
  }

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].perform();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0B0F17] border border-slate-300 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to any governance module..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-slate-900">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching governance commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    item.perform();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left text-xs transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <div className="truncate">
                      <span className="font-medium">{item.title}</span>
                      <span
                        className={`ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          active
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <kbd
                      className={`px-1.5 py-0.5 font-mono text-[10px] rounded ${
                        active
                          ? 'bg-indigo-700 text-indigo-100'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                    <CornerDownLeft className="w-3 h-3 opacity-60" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>↑↓ Navigate • Enter Execute</span>
          <span>CONSENTLOG COMMAND ENGINE v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
