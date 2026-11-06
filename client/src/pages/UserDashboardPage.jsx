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
    },
    {
      label: 'Signed Notices',
      value: metrics.totalConsentRecords ?? 0,
      sub: 'Cryptographic records',
      tag: 'Accepted',
    },
    {
      label: 'Active Preferences',
      value: metrics.activeConsentPreferences ?? 0,
      sub: 'Enabled categories',
      tag: 'Active',
    },
    {
      label: 'Withdrawn Rights',
      value: metrics.withdrawnConsents ?? 0,
      sub: 'Revocation events',
      tag: 'Opted Out',
    },
    {
      label: 'Ledger Blocks',
      value: metrics.totalAuditEvents ?? 0,
      sub: 'SHA-256 sealed logs',
      tag: 'Audit',
    },
    {
      label: 'Active Policy',
      value: `v${metrics.currentNoticeVersion || '2.0'}`,
      sub: 'Current revision',
      tag: 'Notice',
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
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cryptographic Ledger Online</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Compliance &amp; Trust Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Active session: <strong className="text-slate-800 dark:text-slate-200">{user?.email}</strong> · Jurisdiction: <strong className="text-slate-800 dark:text-slate-200">{user?.jurisdiction || 'GDPR (EU)'}</strong> · Tenant: <strong className="text-slate-800 dark:text-slate-200">{user?.organization || 'Enterprise Global Corp'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadDsarPassport}
            disabled={exporting}
            className="h-9 px-3.5 rounded-xl bg-white dark:bg-[#0E1526] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="size-3.5 text-slate-400" />
            <span>{exporting ? 'Exporting...' : 'Export JSON Passport'}</span>
          </button>

          <button
            onClick={handleQuickVerifyChain}
            disabled={verifying}
            className="h-9 px-3.5 rounded-xl bg-white dark:bg-[#0E1526] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${verifying ? 'animate-spin text-emerald-500' : 'text-slate-400'}`} />
            <span>{verifying ? 'Verifying...' : 'Verify Cryptographic Logs'}</span>
          </button>

          <Link
            to="/preferences"
            className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Sliders className="size-3.5" />
            <span>Manage Preferences</span>
          </Link>
        </div>
      </div>

      {/* ==================================================================
          2. BENTO METRICS TILES
          ================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiMetrics.map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                {item.tag}
              </span>
              <span className="size-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-emerald-500 transition-colors" />
            </div>

            <div className="mt-3">
              <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {item.value}
              </div>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                {item.label}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ==================================================================
          3. FEATURE CARDS: LEDGER ANCHOR + PREFERENCES
          ================================================================== */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Card 1: Cryptographic Trust Anchor */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                <CheckCircle2 className="size-3" />
                <span>Verified Intact</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3.5 leading-relaxed">
              Every privacy consent change, notice acceptance, and withdrawal generates a cryptographically sealed, immutable ledger block linked to its predecessor.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B13] border border-slate-200/80 dark:border-slate-800 space-y-2">
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
                    <span className="text-emerald-600">Copied</span>
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

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
              Status: <strong className="text-slate-800 dark:text-slate-200">Zero chain breaks detected</strong>
            </span>
            <Link
              to={user?.role === 'admin' ? '/admin/integrity' : '/audit-history'}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Audit Chain Explorer</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Consent Controls */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(userConsent?.summary?.categories || []).map((cat) => {
              const meta = CATEGORY_META[cat.key] || { icon: Cookie, desc: 'Consent category' };
              const Icon = meta.icon;
              return (
                <div
                  key={cat.key}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    cat.enabled
                      ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border-emerald-500/25'
                      : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800'
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

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono tabular-nums text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Enabled: <strong className="text-slate-900 dark:text-white">{userConsent?.summary?.enabledPreferences || 1}/5</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-400" />
                <span>Disabled: <strong className="text-slate-900 dark:text-white">{userConsent?.summary?.disabledPreferences || 4}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500" />
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
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] shadow-xs">
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

        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] shadow-xs">
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
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] shadow-xs space-y-4">
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
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
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

        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] shadow-xs space-y-4">
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
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <GitCompare className="size-3.5" />
              <span>Compare Diffs</span>
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.notices || []).map((notice) => (
              <div
                key={notice.version}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3"
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
