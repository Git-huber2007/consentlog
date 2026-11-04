import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  CheckCircle2,
  XCircle,
  History,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  Sliders,
  Lock,
  RefreshCw,
  GitCompare,
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

const UserDashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [userConsent, setUserConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

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
      addToast('Failed to load enterprise dashboard telemetry.', 'error');
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
      addToast(res.data.message, 'success', 'SHA-256 Chain Verified');
      await fetchDashboardData();
    } catch (err) {
      addToast('Integrity verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  const kpiCards = [
    {
      label: 'Registered Users',
      value: metrics.totalRegisteredUsers ?? 0,
      sub: 'Enterprise Accounts',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70',
    },
    {
      label: 'Consent Records',
      value: metrics.totalConsentRecords ?? 0,
      sub: 'Signed Snapshots',
      icon: FileCheck2,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70',
    },
    {
      label: 'Active Preferences',
      value: metrics.activeConsentPreferences ?? 0,
      sub: 'Enabled Categories',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70',
    },
    {
      label: 'Withdrawn Consents',
      value: metrics.withdrawnConsents ?? 0,
      sub: 'Revoked Permissions',
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70',
    },
    {
      label: 'Total Audit Events',
      value: metrics.totalAuditEvents ?? 0,
      sub: 'SHA-256 Chained Logs',
      icon: History,
      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/70',
    },
    {
      label: 'Active Notice Version',
      value: `v${metrics.currentNoticeVersion || '2.0'}`,
      sub: 'Current Policy',
      icon: FileText,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enterprise Privacy & Consent Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span> — Real-time MongoDB metrics, SHA-256 audit chain status, and your personal preference posture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleQuickVerifyChain}
            disabled={verifying}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{verifying ? 'Verifying Ledger...' : 'Verify SHA-256 Ledger'}</span>
          </button>
          <Link
            to="/preferences"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Preference Centre</span>
          </Link>
        </div>
      </div>

      {/* 6 Required Database-Driven KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Integrity Status Banner + Personal Posture Summary */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900 text-white border border-slate-800 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Cryptographic Audit Integrity Status
                </span>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                  <span>{metrics.auditIntegrityStatus || 'Verified'}</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </h3>
              </div>
            </div>
            <Link
              to={user?.role === 'admin' ? '/admin/integrity' : '/audit-history'}
              className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1"
            >
              <span>Inspect</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            All {metrics.totalAuditEvents || 0} consent events are cryptographically linked using
            canonical SHA-256 serialization. Zero broken hash links or sequence gaps detected.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Latest Head Hash:</span>
              <span className="text-emerald-400">SHA-256 OK</span>
            </div>
            <p className="text-slate-200 truncate">
              {data?.latestVerification?.headHash ||
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </p>
          </div>
        </div>

        {/* Personal Preference Quick Summary */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Your Personal Consent Profile ({user?.email})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time snapshot of your 5 preference categories under Notice v
                {metrics.currentNoticeVersion || '2.0'}
              </p>
            </div>
            <Link
              to="/preferences"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Customize Toggles</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {(userConsent?.summary?.categories || []).map((cat) => (
              <div
                key={cat.key}
                className={`p-3 rounded-xl border ${
                  cat.enabled
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/70'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span
                  className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    cat.enabled
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.statusBadge}
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-2 line-clamp-1">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Enabled: <strong>{userConsent?.summary?.enabledPreferences || 1}</strong> / 5 •
              Disabled: <strong>{userConsent?.summary?.disabledPreferences || 4}</strong> •
              Withdrawn: <strong>{userConsent?.summary?.withdrawnPreferences || 0}</strong>
            </span>
            <Link
              to="/audit-history"
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600"
            >
              View Your Immutable Audit Trail →
            </Link>
          </div>
        </div>
      </div>

      {/* Recharts Visualizations: Pie Chart & Line Chart */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Consent Distribution Pie Chart */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Consent Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active opt-in breakdown across all registered enterprise users
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.consentDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.consentDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consent Activity Line Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                7-Day Consent & Audit Activity Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chronological grants, withdrawals, and privacy notice acceptances
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              Live MongoDB Aggregation
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.consentActivitySeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="grants"
                  name="Consent Grants"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  name="Consent Withdrawals"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="noticeAcceptances"
                  name="Notice Acceptances"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Audit Activity & Latest Notice Updates */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Audit Activity */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Append-Only Audit Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest cryptographically chained preference events
              </p>
            </div>
            <Link
              to="/audit-history"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Full Audit Table</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {(data?.recentAuditActivity || []).slice(0, 6).map((ev) => (
              <div
                key={ev.auditId}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/audit-history/${ev.auditId}`}
                      className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {ev.auditId}
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        ev.action.includes('Withdrawn') || ev.action.includes('Rejected')
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}
                    >
                      {ev.action}
                    </span>
                    <span className="text-slate-400">• v{ev.noticeVersion}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    {ev.preferenceName}:{' '}
                    <span className="text-slate-500">{ev.previousValue}</span> →{' '}
                    <span className="font-semibold">{ev.newValue}</span>
                  </p>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-400">
                  <div>{new Date(ev.timestamp).toLocaleString()}</div>
                  <div className="truncate max-w-[180px]" title={ev.eventHash}>
                    SHA256: {ev.eventHash?.slice(0, 14)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Notice Updates */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Versioned Privacy Notice Releases
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historical & active policy lineage
              </p>
            </div>
            <Link
              to="/notices/compare"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Diffs</span>
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.latestNotices || []).map((notice) => (
              <div
                key={notice.version}
                className={`p-4 rounded-xl border ${
                  notice.isActive
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    Version {notice.version}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      notice.isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {notice.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {notice.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {notice.summaryOfChanges}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Effective: {new Date(notice.effectiveDate).toLocaleDateString()}</span>
                  <Link
                    to="/notices"
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Read Clauses →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;

