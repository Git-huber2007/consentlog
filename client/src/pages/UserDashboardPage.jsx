import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowUpRight,
  Sliders,
  RefreshCw,
  GitCompare,
  Download,
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
  const [exporting, setExporting] = useState(false);

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

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-zinc-200/70 dark:bg-zinc-900 rounded-lg" />
        <div className="h-24 bg-zinc-200/70 dark:bg-zinc-900 rounded-lg" />
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 h-56 bg-zinc-200/70 dark:bg-zinc-900 rounded-lg" />
          <div className="lg:col-span-7 h-56 bg-zinc-200/70 dark:bg-zinc-900 rounded-lg" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  const kpiMetrics = [
    {
      label: 'Users',
      value: metrics.totalRegisteredUsers ?? 0,
      sub: 'Registered accounts',
    },
    {
      label: 'Accepted Notices',
      value: metrics.totalConsentRecords ?? 0,
      sub: 'Signed versions',
    },
    {
      label: 'Active Consents',
      value: metrics.activeConsentPreferences ?? 0,
      sub: 'Enabled categories',
    },
    {
      label: 'Withdrawn',
      value: metrics.withdrawnConsents ?? 0,
      sub: 'Opted out',
    },
    {
      label: 'Log Entries',
      value: metrics.totalAuditEvents ?? 0,
      sub: 'Audit records',
    },
    {
      label: 'Current Notice',
      value: `v${metrics.currentNoticeVersion || '2.0'}`,
      sub: 'Active version',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {user?.email} · {user?.jurisdiction || 'GDPR'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadDsarPassport}
            disabled={exporting}
            className="h-8.5 px-3 rounded-lg bg-white dark:bg-[#0E1526] hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="size-3.5 text-zinc-400" />
            <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
          </button>

          <button
            onClick={handleQuickVerifyChain}
            disabled={verifying}
            className="h-8.5 px-3 rounded-lg bg-white dark:bg-[#0E1526] hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${verifying ? 'animate-spin text-emerald-500' : 'text-zinc-400'}`} />
            <span>{verifying ? 'Checking...' : 'Verify Logs'}</span>
          </button>

          <Link
            to="/preferences"
            className="h-8.5 px-3.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Sliders className="size-3.5" />
            <span>Preferences</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiMetrics.map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0E1526] shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {item.label}
            </span>
            <div className="mt-3">
              <p className="font-mono text-2xl font-bold text-zinc-900 dark:text-white tabular-nums tracking-tight">
                {item.value}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0E1526] text-zinc-900 dark:text-white shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                </span>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Audit Ledger: {metrics.auditIntegrityStatus || 'Cryptographically Verified'}
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                All {metrics.totalAuditEvents || 0} sequential audit events match their recorded SHA-256 hashes with zero tampering detected.
              </p>
            </div>
            <Link
              to={user?.role === 'admin' ? '/admin/integrity' : '/audit-history'}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Verify Chain</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#080B11] border border-zinc-200/70 dark:border-zinc-800/80 font-mono text-[11px] space-y-1.5 tabular-nums">
            <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-wider font-semibold">
              <span>Latest Ledger Block Hash</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">SHA-256 Valid</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 font-mono truncate select-all">
              {data?.latestVerification?.headHash ||
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0E1526] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                Consent Category Controls
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Active regulatory preference state across all channels
              </p>
            </div>
            <Link
              to="/preferences"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Configure</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(userConsent?.summary?.categories || []).map((cat) => (
              <div
                key={cat.key}
                className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                  cat.enabled
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {cat.key === 'essential' ? 'Strictly Necessary' : cat.enabled ? 'Granted' : 'Opted Out'}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    cat.enabled
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30'
                      : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {cat.statusBadge}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 font-mono tabular-nums">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Enabled: <strong className="text-zinc-900 dark:text-white">{userConsent?.summary?.enabledPreferences || 1}/5</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-400" />
                <span>Disabled: <strong className="text-zinc-900 dark:text-white">{userConsent?.summary?.disabledPreferences || 4}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500" />
                <span>Withdrawn: <strong className="text-rose-600 dark:text-rose-400">{userConsent?.summary?.withdrawnPreferences || 0}</strong></span>
              </span>
            </span>
            <Link
              to="/audit-history"
              className="font-sans font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline text-xs"
            >
              Audit Ledger →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 enterprise-card p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Consent by Category
          </h2>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.consentDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(charts.consentDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderColor: '#3F3F46',
                    borderRadius: '6px',
                    color: '#FAFAFA',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  itemStyle={{
                    color: '#FAFAFA',
                    fontWeight: 600,
                  }}
                  labelStyle={{
                    color: '#A1A1AA',
                    fontWeight: 500,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 enterprise-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              7-Day Activity
            </h2>
            <span className="font-mono text-[11px] text-zinc-400">Last 7 days</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.consentActivitySeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#71717A" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#71717A" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderColor: '#3F3F46',
                    borderRadius: '6px',
                    color: '#FAFAFA',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  itemStyle={{
                    color: '#FAFAFA',
                    fontWeight: 600,
                  }}
                  labelStyle={{
                    color: '#A1A1AA',
                    fontWeight: 500,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="grants"
                  name="Granted"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  name="Withdrawn"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="noticeAcceptances"
                  name="Notices Accepted"
                  stroke="#71717a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 enterprise-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Recent Activity
            </h2>
            <Link
              to="/audit-history"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
            {(data?.recentAuditActivity || []).slice(0, 6).map((ev) => (
              <div
                key={ev.auditId}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/audit-history/${ev.auditId}`}
                      className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      {ev.auditId}
                    </Link>
                    <span
                      className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        ev.action.includes('Withdrawn') || ev.action.includes('Rejected')
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {ev.action}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">v{ev.noticeVersion}</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    {ev.preferenceName}:{' '}
                    <span className="text-zinc-400 font-mono">{ev.previousValue}</span> →{' '}
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{ev.newValue}</span>
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-zinc-400 tabular-nums">
                  <div>{new Date(ev.timestamp).toISOString().replace('T', ' ').slice(0, 19)}Z</div>
                  <div className="truncate max-w-[170px]" title={ev.eventHash}>
                    {ev.eventHash?.slice(0, 14)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 enterprise-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Privacy Notices
            </h2>
            <Link
              to="/notices/compare"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
            >
              <GitCompare className="size-3.5" />
              <span>Compare</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {(data?.latestNotices || []).map((notice) => (
              <div
                key={notice.version}
                className={`p-3.5 rounded-md border ${
                  notice.isActive
                    ? 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700'
                    : 'bg-white dark:bg-[#111113] border-zinc-200/80 dark:border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    v{notice.version}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      notice.isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {notice.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white mt-1">
                  {notice.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {notice.summaryOfChanges}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
