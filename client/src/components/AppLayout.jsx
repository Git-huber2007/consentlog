import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Sliders,
  History,
  FileText,
  GitCompare,
  UserCheck,
  Users,
  ShieldAlert,
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const AppLayout = () => {
  const { user, logout, activeNoticeInfo, refreshSession } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const handleLogout = () => {
    logout();
    addToast('Signed out of ConsentLog Enterprise session.', 'info', 'Session Ended');
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

  const navItems = [
    {
      section: 'Privacy & Consent Hub',
      items: [
        { to: '/dashboard', label: 'Enterprise Dashboard', icon: LayoutDashboard },
        { to: '/preferences', label: 'Preference Centre', icon: Sliders },
        { to: '/audit-history', label: 'Consent Audit History', icon: History },
        { to: '/notices', label: 'Privacy Notice Centre', icon: FileText },
        { to: '/notices/compare', label: 'Version Comparison', icon: GitCompare },
        { to: '/profile', label: 'Profile & Jurisdiction', icon: Settings },
      ],
    },
  ];

  if (user?.role === 'admin') {
    navItems.push({
      section: 'Enterprise Administration',
      items: [
        { to: '/admin', label: 'Admin Command Centre', icon: ShieldCheck, exact: true },
        { to: '/admin/users', label: 'User Consent Directory', icon: Users },
        { to: '/admin/integrity', label: 'SHA-256 Chain Verifier', icon: Lock },
        { to: '/admin/notices', label: 'Notice Administration', icon: Sparkles },
      ],
    });
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Dark Navy Enterprise Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-navy-900 text-slate-200 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">ConsentLog</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise Privacy Governance</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6">
          {navItems.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400/90">
                {group.section}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact || item.to === '/notices'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
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

          {/* Cryptographic Ledger Badge */}
          <div className="mx-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SHA-256 Append-Only Ledger
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              Every consent action is cryptographically hash-chained and protected against mutation.
            </p>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950/60">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    user?.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {user?.organization || 'Enterprise Global Corp'}
              </span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                {user?.jurisdiction || 'GDPR (EU)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notices"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Active Policy: v{activeNoticeInfo?.version || '2.0'}</span>
              {activeNoticeInfo?.hasAccepted ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px]">
                  Accepted
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px]">
                  Review Needed
                </span>
              )}
            </Link>

            <button
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/preferences"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manage Consent</span>
            </Link>
          </div>
        </header>

        {/* Active Privacy Notice Renewal Banner (Shown when a new version requires renewed consent & user hasn't accepted yet) */}
        {activeNoticeInfo && !activeNoticeInfo.hasAccepted && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white px-4 sm:px-8 py-3.5 border-b border-indigo-700/60 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  <Bell className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                      Action Required: Updated Privacy Notice v{activeNoticeInfo.version}
                    </span>
                    <span className="text-sm font-semibold">
                      {activeNoticeInfo.notice?.title || 'Updated Enterprise Privacy Notice'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {activeNoticeInfo.notice?.summaryOfChanges ||
                      'A new privacy notice version is active and requires your renewed acknowledgment.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <Link
                  to="/notices/compare"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors flex items-center gap-1"
                >
                  <span>Compare Changes</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleQuickAcknowledgeNotice}
                  disabled={acknowledging}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{acknowledging ? 'Recording...' : `Accept v${activeNoticeInfo.version}`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

