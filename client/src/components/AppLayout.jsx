import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Sliders,
  History,
  FileText,
  GitCompare,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  Lock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import CommandPalette from './CommandPalette';
import api from '../services/api';

const ROUTE_TITLES = {
  '/dashboard': ['Telemetry', 'Enterprise Overview'],
  '/preferences': ['Governance', 'Interactive Preference Centre'],
  '/audit-history': ['Cryptographic Ledger', 'Consent Audit History'],
  '/notices': ['Policy Repository', 'Versioned Privacy Notices'],
  '/notices/compare': ['Policy Repository', 'Clause Diff Engine'],
  '/profile': ['Workspace', 'Profile & Jurisdiction'],
  '/admin': ['Administration', 'CPO Command Centre'],
  '/admin/users': ['Administration', 'Subject Consent Directory'],
  '/admin/integrity': ['Administration', 'SHA-256 Chain Verifier & Lab'],
  '/admin/notices': ['Administration', 'Notice Lifecycle Publisher'],
};

const AppLayout = () => {
  const { user, logout, activeNoticeInfo, refreshSession } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    addToast('Session terminated.', 'info', 'Signed Out');
    navigate('/login');
  };

  const handleQuickAcknowledgeNotice = async () => {
    if (!activeNoticeInfo?.version) return;
    setAcknowledging(true);
    try {
      await api.post('/notices/acknowledge', {
        version: activeNoticeInfo.version,
        method: 'Explicit Banner Acceptance',
      });
      await refreshSession();
      addToast(
        `Privacy Notice v${activeNoticeInfo.version} formally accepted and chained into the SHA-256 audit log.`,
        'success',
        'Notice Accepted'
      );
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to acknowledge privacy notice.',
        'error',
        'Error'
      );
    } finally {
      setAcknowledging(false);
    }
  };

  const breadcrumbs = ROUTE_TITLES[location.pathname] || [
    'Cryptographic Ledger',
    location.pathname.startsWith('/audit-history/') ? 'Block Certificate Inspection' : 'Console',
  ];

  const navItems = [
    {
      section: 'Consent & Governance',
      items: [
        { to: '/dashboard', label: 'Telemetry Overview', icon: LayoutDashboard },
        { to: '/preferences', label: 'Preference Centre', icon: Sliders },
        { to: '/audit-history', label: 'Immutable Audit Log', icon: History },
        { to: '/notices', label: 'Privacy Notices', icon: FileText },
        { to: '/notices/compare', label: 'Version Diff Engine', icon: GitCompare },
        { to: '/profile', label: 'Subject & Jurisdiction', icon: Settings },
      ],
    },
  ];

  if (user?.role === 'admin') {
    navItems.push({
      section: 'CPO Administration',
      items: [
        { to: '/admin', label: 'Command Centre', icon: ShieldCheck, exact: true },
        { to: '/admin/users', label: 'Subject Directory', icon: Users },
        { to: '/admin/integrity', label: 'SHA-256 Verifier & Lab', icon: Lock },
        { to: '/admin/notices', label: 'Policy Publisher', icon: Sparkles },
      ],
    });
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#080C14] text-slate-900 dark:text-slate-100">
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Architectural Dark Navy Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0B0F17] text-slate-300 flex flex-col border-r border-slate-800/90 transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center border border-indigo-400/30">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">ConsentLog</span>
              <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                ENT-2.0
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Command Trigger inside Sidebar */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="w-full px-3 py-1.5 rounded-md bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Quick Command...</span>
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navItems.map((group, idx) => (
            <div key={idx}>
              <p className="px-2.5 mb-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact || item.to === '/notices'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-600/15 text-white border-l-2 border-indigo-500 font-semibold'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Cryptographic Status Specification Box */}
          <div className="mx-1 p-3 rounded-md bg-slate-950 border border-slate-800/90 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">LEDGER MODE</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                APPEND-ONLY
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">HASH CIPHER</span>
              <span className="text-slate-200">SHA-256</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">ACTIVE NOTICE</span>
              <span className="text-indigo-400 font-semibold">
                v{activeNoticeInfo?.version || '2.0'}
              </span>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080B11]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <span
                  className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                    user?.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Precision Top Header Bar */}
        <header className="h-14 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-medium">
                {breadcrumbs[0]}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {breadcrumbs[1]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span>{user?.jurisdiction || 'GDPR (EU)'}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>POLICY v{activeNoticeInfo?.version || '2.0'}</span>
            </div>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="font-mono text-[10px]">⌘K</kbd>
            </button>

            <button
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <Link
              to="/preferences"
              className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preferences</span>
            </Link>
          </div>
        </header>

        {/* Active Privacy Notice Renewal Banner */}
        {activeNoticeInfo && !activeNoticeInfo.hasAccepted && (
          <div className="bg-amber-500/10 dark:bg-amber-500/10 border-b border-amber-500/30 px-4 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px]">
                  RENEWAL REQUIRED • v{activeNoticeInfo.version}
                </span>
                <span className="font-semibold text-slate-900 dark:text-amber-100">
                  {activeNoticeInfo.notice?.title || 'Updated Enterprise Privacy Notice'}
                </span>
                <span className="hidden lg:inline text-slate-600 dark:text-slate-400">
                  — {activeNoticeInfo.notice?.summaryOfChanges}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link
                  to="/notices/compare"
                  className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1"
                >
                  <span>Inspect Diff</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={handleQuickAcknowledgeNotice}
                  disabled={acknowledging}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-[11px] font-semibold text-white flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{acknowledging ? 'Signing...' : `Acknowledge v${activeNoticeInfo.version}`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
