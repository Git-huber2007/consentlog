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
  Lock,
  CheckCircle2,
  ArrowUpRight,
  Search,
  ChevronRight,
  FilePlus,
  Building2,
  Monitor,
  Webhook as WebhookIcon,
  UserX,
  Cookie,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import CommandPalette from './CommandPalette';
import api from '../services/api';

const ROUTE_TITLES = {
  '/dashboard': ['Menu', 'Dashboard'],
  '/preferences': ['Menu', 'Preferences'],
  '/audit-history': ['Menu', 'Audit Log'],
  '/inventory': ['Menu', 'Cookie Inventory'],
  '/notices': ['Menu', 'Privacy Notices'],
  '/notices/compare': ['Menu', 'Compare Versions'],
  '/profile': ['Menu', 'Account'],
  '/admin': ['Admin', 'Overview'],
  '/admin/users': ['Admin', 'Users'],
  '/admin/integrity': ['Admin', 'Log Verification'],
  '/admin/notices': ['Admin', 'Manage Notices'],
  '/admin/simulator': ['Admin', 'Banner Simulator'],
  '/admin/webhooks': ['Admin', 'Webhooks'],
  '/admin/dsar': ['Admin', 'DSAR Erasure'],
  '/admin/cookies': ['Admin', 'Cookie Inventory'],
  '/admin/developer': ['Admin', 'API Keys'],
  '/simulator': ['Tools', 'Banner Simulator'],
};

const AppLayout = () => {
  const { user, logout, activeNoticeInfo, refreshSession, switchOrganization } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const handleOrgChange = async (e) => {
    const newOrg = e.target.value;
    try {
      if (switchOrganization) {
        await switchOrganization(newOrg);
      }
      addToast(`Switched active organization to ${newOrg}`, 'success');
    } catch (err) {
      addToast('Could not switch organization.', 'error');
    }
  };
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
    addToast('Signed out.', 'info');
    navigate('/login');
  };

  const handleQuickAcknowledgeNotice = async () => {
    if (!activeNoticeInfo?.version) return;
    setAcknowledging(true);
    try {
      await api.post('/notices/acknowledge', {
        version: activeNoticeInfo.version,
        method: 'Banner Acceptance',
      });
      await refreshSession();
      addToast(`Accepted Privacy Notice v${activeNoticeInfo.version}.`, 'success');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Could not accept privacy notice.',
        'error'
      );
    } finally {
      setAcknowledging(false);
    }
  };

  const breadcrumbs = ROUTE_TITLES[location.pathname] || [
    'Menu',
    location.pathname.startsWith('/audit-history/') ? 'Log Entry' : 'Dashboard',
  ];

  const navItems = [
    {
      section: 'Menu',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/preferences', label: 'Preferences', icon: Sliders },
        { to: '/audit-history', label: 'Audit Log', icon: History },
        { to: '/inventory', label: 'Cookie Inventory', icon: Cookie },
        { to: '/notices', label: 'Privacy Notices', icon: FileText },
        { to: '/notices/compare', label: 'Compare Versions', icon: GitCompare },
        { to: '/profile', label: 'Account', icon: Settings },
      ],
    },
  ];

  if (user?.role === 'admin') {
    navItems.push({
      section: 'Admin',
      items: [
        { to: '/admin', label: 'Overview', icon: ShieldCheck, exact: true },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/integrity', label: 'Log Verification', icon: Lock },
        { to: '/admin/notices', label: 'Manage Notices', icon: FilePlus },
        { to: '/admin/simulator', label: 'Banner Simulator', icon: Monitor },
        { to: '/admin/webhooks', label: 'Webhooks', icon: WebhookIcon },
        { to: '/admin/dsar', label: 'DSAR Erasure', icon: UserX },
        { to: '/admin/developer', label: 'API Keys', icon: Key },
      ],
    });
  } else if (user?.role === 'auditor') {
    navItems.push({
      section: 'Auditor',
      items: [
        { to: '/admin', label: 'Overview', icon: ShieldCheck, exact: true },
        { to: '/admin/integrity', label: 'Log Verification', icon: Lock },
      ],
    });
  } else if (user?.role === 'dpo') {
    navItems.push({
      section: 'Governance',
      items: [
        { to: '/admin', label: 'Overview', icon: ShieldCheck, exact: true },
        { to: '/admin/dsar', label: 'DSAR Erasure', icon: UserX },
        { to: '/inventory', label: 'Cookie Inventory', icon: Cookie },
      ],
    });
  }

  return (
    <div className="min-h-dvh flex bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100">
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white dark:bg-[#0C0C0E] border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="size-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <ShieldCheck className="size-3.5 text-white dark:text-zinc-950" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              ConsentLog
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="lg:hidden size-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="w-full h-8 px-2.5 rounded-md bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-800 text-xs text-zinc-500 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5 text-zinc-400" />
              <span>Search...</span>
            </span>
            <kbd className="font-mono text-[10px] text-zinc-400">⌘K</kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navItems.map((group, idx) => (
            <div key={idx}>
              <p className="px-2.5 mb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
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
                        `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                          isActive
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.name?.replace(/\s*\(.*?\)\s*/g, '')}
                </p>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {user?.role === 'admin'
                    ? 'Admin'
                    : user?.role === 'dpo'
                    ? 'DPO'
                    : user?.role === 'auditor'
                    ? 'Auditor'
                    : 'User'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="size-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 shrink-0"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#FAFAFA]/85 dark:bg-[#09090B]/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="lg:hidden size-8 inline-flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Menu className="size-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 dark:text-zinc-500">{breadcrumbs[0]}</span>
              <ChevronRight className="size-3.5 text-zinc-300 dark:text-zinc-700" />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {breadcrumbs[1]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center relative">
              <Building2 className="size-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
              <select
                value={user?.organization || 'Enterprise Global Corp'}
                onChange={handleOrgChange}
                aria-label="Active Organization"
                className="h-8 pl-8 pr-3 text-xs font-medium rounded-md border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#111113] text-zinc-700 dark:text-zinc-200 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                title="Active Tenant Organization"
              >
                <option value="Enterprise Global Corp">Enterprise Global Corp</option>
                <option value="Pacific Health Systems">Pacific Health Systems</option>
                <option value="CloudScale Data Networks">CloudScale Data Networks</option>
                <option value="Apex Financial Services">Apex Financial Services</option>
              </select>
            </div>

            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-800 tabular-nums">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{user?.jurisdiction || 'GDPR'}</span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="font-mono text-[11px]">Notice v{activeNoticeInfo?.version || '2.0'}</span>
            </span>

            <button
              onClick={toggleTheme}
              title={darkMode ? 'Light mode' : 'Dark mode'}
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
              className="size-8 inline-flex items-center justify-center rounded-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </header>

        {activeNoticeInfo && !activeNoticeInfo.hasAccepted && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-8 py-2.5">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] tabular-nums">
                  v{activeNoticeInfo.version}
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Updated privacy notice available
                </span>
                <span className="hidden lg:inline text-zinc-600 dark:text-zinc-400">
                  {activeNoticeInfo.notice?.summaryOfChanges}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link
                  to="/notices/compare"
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-xs font-medium text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1"
                >
                  <span>Compare Changes</span>
                  <ArrowUpRight className="size-3" />
                </Link>
                <button
                  onClick={handleQuickAcknowledgeNotice}
                  disabled={acknowledging}
                  className="px-3 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>
                    {acknowledging ? 'Saving...' : `Accept v${activeNoticeInfo.version}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
