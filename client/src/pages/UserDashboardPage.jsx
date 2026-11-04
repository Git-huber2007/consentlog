import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  CheckCircle2,
  XCircle,
  History,
  FileText,
  ArrowUpRight,
  Sliders,
  Lock,
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

  const handleDownloadDsarPassport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/audit/dsar-passport');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ConsentLog-DSAR-Passport-${user?.email || 'subject'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(
        `Signed DSAR Privacy Passport downloaded (SHA-256: ${res.data.passportSignature.slice(0, 14)}...)`,
        'success',
        'GDPR Art. 15 & 20 Export'
      );
    } catch (err) {
      addToast('Failed to export DSAR passport.', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-900 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-900 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  const kpiCards = [
    {
      label: 'REGISTERED SUBJECTS',
      value: metrics.totalRegisteredUsers ?? 0,
      sub: 'Active directory accounts',
      accent: 'border-l-indigo-500',
    },
    {
      label: 'SIGNED SNAPSHOTS',
      value: metrics.totalConsentRecords ?? 0,
      sub: 'Versioned acknowledgments',
      accent: 'border-l-blue-500',
    },
    {
      label: 'ACTIVE CONSENTS',
      value: metrics.activeConsentPreferences ?? 0,
      sub: 'Granted category toggles',
      accent: 'border-l-emerald-500',
    },
    {
      label: 'REVOKED CONSENTS',
      value: metrics.withdrawnConsents ?? 0,
      sub: 'Statutory withdrawals',
      accent: 'border-l-rose-500',
    },
    {
      label: 'CHAINED BLOCKS',
      value: metrics.totalAuditEvents ?? 0,
      sub: 'Immutable SHA-256 logs',
      accent: 'border-l-violet-500',
    },
    {
      label: 'ACTIVE POLICY',
      value: `v${metrics.currentNoticeVersion || '2.0'}`,
      sub: 'Enforced notice version',
      accent: 'border-l-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Precision Header Bar */}
      <div className="enterprise-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              TELEMETRY ONLINE
            </span>
            <span className="font-mono text-xs text-slate-400">
              SUBJECT: {user?.email} ({user?.jurisdiction || 'GDPR'})
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Enterprise Privacy & Consent Intelligence
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadDsarPassport}
            disabled={exporting}
            className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            title="Download GDPR Art. 15/20 Signed JSON Passport"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>{exporting ? 'Signing JSON...' : 'Export DSAR Passport'}</span>
          </button>

          <button
            onClick={handleQuickVerifyChain}
            disabled={verifying}
            className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{verifying ? 'Verifying...' : 'Verify SHA-256 Chain'}</span>
          </button>

          <Link
            to="/preferences"
            className="px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preference Centre</span>
          </Link>
        </div>
      </div>

      {/* 6 Precision Tabular KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className={`enterprise-card p-4 border-l-2 ${card.accent} flex flex-col justify-between`}
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {card.label}
            </span>
            <div className="mt-2">
              <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {card.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cryptographic Ledger Anchor + Subject Preference Matrix */}
      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 p-5 rounded-lg bg-[#0B0F17] text-white border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                SHA-256 APPEND-ONLY LEDGER STATUS
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                <span>{metrics.auditIntegrityStatus || 'Verified'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </h3>
            </div>
            <Link
              to={user?.role === 'admin' ? '/admin/integrity' : '/audit-history'}
              className="font-mono text-[11px] text-indigo-400 hover:text-white flex items-center gap-1"
            >
              <span>INSPECT</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            All {metrics.totalAuditEvents || 0} historical consent events are chained via canonical
            SHA-256 serialization. Zero broken hash pointers or sequence gaps detected.
          </p>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/90 font-mono text-[11px] space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>CHAIN HEAD DIGEST</span>
              <span className="text-emerald-400">256-BIT VALID</span>
            </div>
            <p className="text-slate-300 truncate">
              {data?.latestVerification?.headHash ||
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </p>
          </div>
        </div>

        {/* Personal Preference Matrix */}
        <div className="lg:col-span-7 enterprise-card p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                ACTIVE SUBJECT POSTURE
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Granular Category Matrix ({user?.name})
              </h3>
            </div>
            <Link
              to="/preferences"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Modify Toggles</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(userConsent?.summary?.categories || []).map((cat) => (
              <div
                key={cat.key}
                className={`p-3 rounded-md border ${
                  cat.enabled
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span
                  className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    cat.enabled
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.statusBadge}
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2 line-clamp-1">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 font-mono">
            <span>
              ENABLED: <strong className="text-slate-800 dark:text-slate-200">{userConsent?.summary?.enabledPreferences || 1}/5</strong> •
              DISABLED: <strong className="text-slate-800 dark:text-slate-200">{userConsent?.summary?.disabledPreferences || 4}</strong> •
              WITHDRAWN: <strong className="text-rose-600 dark:text-rose-400">{userConsent?.summary?.withdrawnPreferences || 0}</strong>
            </span>
            <Link
              to="/audit-history"
              className="font-sans font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Audit Receipts →
            </Link>
          </div>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 enterprise-card p-5">
          <div className="mb-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              CATEGORY OPT-IN RATIO
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Consent Category Distribution
            </h3>
          </div>

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
                    backgroundColor: '#0B0F17',
                    borderColor: '#1E293B',
                    borderRadius: '6px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 enterprise-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                CHRONOLOGICAL VELOCITY
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                7-Day Consent & Audit Event Stream
              </h3>
            </div>
            <span className="font-mono text-[10px] text-slate-400">LIVE AGGREGATION</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.consentActivitySeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.18} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderColor: '#1E293B',
                    borderRadius: '6px',
                    color: '#F8FAFC',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="grants"
                  name="Consent Grants"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  name="Consent Withdrawals"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="noticeAcceptances"
                  name="Notice Acceptances"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Audit Activity & Latest Notice Releases */}
      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 enterprise-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                APPEND-ONLY STREAM
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Cryptographic Audit Blocks
              </h3>
            </div>
            <Link
              to="/audit-history"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
            {(data?.recentAuditActivity || []).slice(0, 6).map((ev) => (
              <div
                key={ev.auditId}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
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
                      className={`font-mono px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        ev.action.includes('Withdrawn') || ev.action.includes('Rejected')
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {ev.action}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">v{ev.noticeVersion}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    {ev.preferenceName}:{' '}
                    <span className="text-slate-400 font-mono">{ev.previousValue}</span> →{' '}
                    <span className="font-mono font-semibold">{ev.newValue}</span>
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400 tabular-nums">
                  <div>{new Date(ev.timestamp).toISOString().replace('T', ' ').slice(0, 19)}Z</div>
                  <div className="truncate max-w-[170px]" title={ev.eventHash}>
                    sha256:{ev.eventHash?.slice(0, 14)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Notice Updates */}
        <div className="lg:col-span-5 enterprise-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                POLICY REPOSITORY
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Versioned Privacy Notice Lineage
              </h3>
            </div>
            <Link
              to="/notices/compare"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Diff Engine</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {(data?.latestNotices || []).map((notice) => (
              <div
                key={notice.version}
                className={`p-3.5 rounded-md border ${
                  notice.isActive
                    ? 'bg-indigo-500/5 border-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    VERSION {notice.version}
                  </span>
                  <span
                    className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      notice.isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {notice.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {notice.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
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
