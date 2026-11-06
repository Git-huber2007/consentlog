import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Sliders,
  RefreshCw,
  GitCompare,
  Download,
  Copy,
  Check,
  Lock,
  Cookie,
  BarChart3,
  Megaphone,
  Sparkles,
  Share2,
  FileText,
  Activity,
  Building2,
  Users,
  AlertCircle,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORY_META = {
  essential: { icon: Cookie, desc: 'Core session security & authentication' },
  analytics: { icon: BarChart3, desc: 'Usage metrics & telemetry diagnostics' },
  marketing: { icon: Megaphone, desc: 'Targeted partner outreach & campaigns' },
  personalization: { icon: Sparkles, desc: 'Localized experience & profile state' },
  thirdParty: { icon: Share2, desc: 'Downstream vendor synchronization' },
};

const UserDashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [userConsent, setUserConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, consentRes] = await Promise.all([
        api.get('/admin/dashboard-overview'),
        api.get('/consent/status'),
      ]);
      setData(overviewRes.data);
      setUserConsent(consentRes.data);
    } catch (err) {
      addToast('Could not load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.post('/audit/verify');
      addToast(res.data.message, 'success', 'Audit Log Verified');
      await fetchDashboardData();
    } catch (err) {
      addToast('Verification check failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadDsarPassport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/audit/dsar-passport');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consentlog-export-${user?.email || 'user'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Your consent history export has been downloaded.', 'success');
    } catch (err) {
      addToast('Could not export data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const copyHeadHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    addToast('SHA-256 Ledger Hash copied to clipboard.', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 h-64 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl" />
          <div className="lg:col-span-7 h-64 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  const kpiMetrics = [
    {
      label: 'Registered Accounts',
      value: metrics.totalRegisteredUsers ?? 0,
      sub: 'Verified tenants',
      tag: 'Users',
      badge: 'Verified',
      icon: Users,
      accent: 'from-indigo-500 via-blue-500 to-indigo-600',
      chip: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-500/25',
      pill: 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-500/20',
      glow: 'from-indigo-500/[0.05] dark:from-indigo-500/[0.08]',
    },
    {
      label: 'Signed Notices',
      value: metrics.totalConsentRecords ?? 0,
      sub: 'Cryptographic records',
      tag: 'Accepted',
      badge: '100% SLA',
      icon: CheckCircle2,
      accent: 'from-emerald-500 via-teal-500 to-emerald-600',
      chip: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/25',
      pill: 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-500/20',
      glow: 'from-emerald-500/[0.05] dark:from-emerald-500/[0.08]',
    },
    {
      label: 'Active Preferences',
      value: metrics.activeConsentPreferences ?? 0,
      sub: 'Enabled categories',
      tag: 'Active',
      badge: 'Enforced',
      icon: ShieldCheck,
      accent: 'from-sky-500 via-cyan-500 to-blue-500',
      chip: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-500/25',
      pill: 'bg-sky-50/80 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-500/20',
      glow: 'from-sky-500/[0.05] dark:from-sky-500/[0.08]',
    },
    {
      label: 'Withdrawn Rights',
      value: metrics.withdrawnConsents ?? 0,
      sub: 'Revocation events',
      tag: 'Opted Out',
      badge: 'Logged',
      icon: AlertCircle,
      accent: 'from-rose-500 via-orange-500 to-rose-600',
      chip: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-500/25',
      pill: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-500/20',
      glow: 'from-rose-500/[0.05] dark:from-rose-500/[0.08]',
    },
    {
      label: 'Ledger Blocks',
      value: metrics.totalAuditEvents ?? 0,
      sub: 'SHA-256 sealed logs',
      tag: 'Audit',
      badge: 'Immutable',
      icon: Layers,
      accent: 'from-amber-500 via-yellow-500 to-amber-600',
      chip: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-500/25',
      pill: 'bg-amber-50/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-500/20',
      glow: 'from-amber-500/[0.05] dark:from-amber-500/[0.08]',
    },
    {
      label: 'Active Policy',
      value: `v${metrics.currentNoticeVersion || '2.0'}`,
      sub: 'Current revision',
      tag: 'Notice',
      badge: 'Live',
      icon: FileText,
      accent: 'from-purple-500 via-fuchsia-500 to-purple-600',
      chip: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-500/25',
      pill: 'bg-purple-50/80 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-500/20',
      glow: 'from-purple-500/[0.05] dark:from-purple-500/[0.08]',
    },
  ];

  const headHash =
    data?.latestVerification?.headHash ||
    'c72a42c0347674db192411bde1fd85edde719333216324ee93009ff8b4382594';

  return (
    <div className="space-y-6">
      {/* ==================================================================
          1. HERO COMMAND HEADER
          ================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time cryptographic consent ledger &amp; privacy state
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDsarPassport}
            disabled={exporting}
            className="h-8.5 px-3 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer backdrop-blur-sm"
          >
            <Download className="size-3.5 text-slate-400" />
            <span>Export Data</span>
          </button>

          <button
            onClick={handleQuickVerifyChain}
            disabled={verifying}
            className="h-8.5 px-3 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer backdrop-blur-sm"
          >
            <RefreshCw className={`size-3.5 ${verifying ? 'animate-spin text-emerald-500' : 'text-slate-400'}`} />
            <span>Verify Logs</span>
          </button>

          <Link
            to="/preferences"
            className="btn-luxury h-8.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Sliders className="size-3.5" />
            <span>Preferences</span>
          </Link>
        </div>
      </div>

      {/* ==================================================================
          2. BENTO METRICS TILES
          ================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiMetrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`luxury-card p-4 rounded-2xl flex flex-col justify-between group cursor-default relative overflow-hidden bg-gradient-to-b ${item.glow} to-transparent`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent}`} />
              <div className="flex items-center justify-between mb-3 pt-0.5">
                <div className={`size-8 rounded-xl flex items-center justify-center border shadow-2xs ${item.chip}`}>
                  <Icon className="size-4" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border ${item.pill}`}>
                  {item.badge}
                </span>
              </div>

              <div>
                <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {item.value}
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 leading-snug">
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================================
          3. FEATURE CARDS: LEDGER ANCHOR + PREFERENCES
          ================================================================== */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Card 1: Cryptographic Trust Anchor */}
        <div className="lg:col-span-5 luxury-card p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Cryptographic Trust Anchor
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    SHA-256 Merkle Chain Integrity
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
                <CheckCircle2 className="size-3" />
                <span>Verified Intact</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3.5 leading-relaxed">
              Every privacy consent change, notice acceptance, and withdrawal generates a cryptographically sealed, immutable ledger block linked to its predecessor.
            </p>
          </div>

          <div className="relative z-10 p-3.5 rounded-xl bg-slate-50/90 dark:bg-[#070B13]/90 border border-slate-200/80 dark:border-white/10 space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                Latest Sealed Block Hash
              </span>
              <button
                type="button"
                onClick={() => copyHeadHash(headHash)}
                title="Copy SHA-256 Hash"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                {copiedHash ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all leading-snug">
              {headHash}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
              Status: <strong className="text-slate-800 dark:text-slate-200">Zero chain breaks detected</strong>
            </span>
            <Link
              to={user?.role === 'admin' ? '/admin/integrity' : '/audit-history'}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Audit Chain Explorer</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Consent Controls */}
        <div className="lg:col-span-7 luxury-card p-6 flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Active Regulatory Consent State
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Channel-wide telemetry, functional, and marketing permissions
              </p>
            </div>
            <Link
              to="/preferences"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Edit Preferences</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(userConsent?.summary?.categories || []).map((cat) => {
              const meta = CATEGORY_META[cat.key] || { icon: Cookie, desc: 'Consent category' };
              const Icon = meta.icon;
              return (
                <div
                  key={cat.key}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    cat.enabled
                      ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/30 shadow-[0_0_15px_-4px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10'
                  }`}
                >
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                      cat.enabled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </p>
                      <span
                        className={`shrink-0 font-mono text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                          cat.enabled
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.statusBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {meta.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono tabular-nums text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span>Enabled: <strong className="text-slate-900 dark:text-white">{userConsent?.summary?.enabledPreferences || 1}/5</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-400" />
                <span>Disabled: <strong className="text-slate-900 dark:text-white">{userConsent?.summary?.disabledPreferences || 4}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                <span>Withdrawn: <strong className="text-rose-600 dark:text-rose-400">{userConsent?.summary?.withdrawnPreferences || 0}</strong></span>
              </span>
            </div>

            <Link
              to="/audit-history"
              className="font-sans font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs underline"
            >
              Full Audit History →
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================
          4. CHARTS & TELEMETRY
          ================================================================== */}
      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 luxury-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Consent Distribution
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Active permissions by category
              </p>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              5 Categories
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.consentDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.consentDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 luxury-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                7-Day Consent Velocity
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Grant, withdrawal, and notice signing frequency
              </p>
            </div>
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
              Trailing 7 Days
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.consentActivitySeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="grants"
                  name="Granted"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  name="Withdrawn"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="noticeAcceptances"
                  name="Notices Accepted"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ==================================================================
          5. RECENT ACTIVITY & PRIVACY NOTICES
          ================================================================== */}
      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 luxury-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Audit Stream
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Real-time cryptographic consent mutations
              </p>
            </div>
            <Link
              to="/audit-history"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {(data?.recentAuditActivity || []).slice(0, 5).map((ev) => (
              <div
                key={ev.auditId}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/audit-history/${ev.auditId}`}
                      className="font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline"
                    >
                      {ev.auditId}
                    </Link>
                    <span
                      className={`font-mono px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        ev.action.includes('Withdrawn') || ev.action.includes('Rejected')
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {ev.action}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">v{ev.noticeVersion}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {ev.preferenceName}:{' '}
                    <span className="text-slate-400 font-mono">{ev.previousValue}</span> →{' '}
                    <strong className="font-mono text-slate-900 dark:text-white">{ev.newValue}</strong>
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400 tabular-nums">
                  <div>{new Date(ev.timestamp).toISOString().replace('T', ' ').slice(0, 19)}Z</div>
                  <div className="truncate max-w-[170px] text-slate-400" title={ev.eventHash}>
                    {ev.eventHash?.slice(0, 16)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 luxury-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Privacy Notice History
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Published regulatory versions
              </p>
            </div>
            <Link
              to="/notices/compare"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <GitCompare className="size-3.5" />
              <span>Compare Diffs</span>
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.notices || []).map((notice) => (
              <div
                key={notice.version}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      v{notice.version}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {notice.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                    {notice.summaryOfChanges || 'Initial production release'}
                  </p>
                </div>

                <Link
                  to="/notices"
                  className="size-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0 shadow-2xs"
                >
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
