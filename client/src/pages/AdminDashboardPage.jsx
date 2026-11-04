import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminDashboardPage = () => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      addToast('Failed to load Admin Command Centre telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRunVerification = async () => {
    setVerifying(true);
    try {
      const res = await api.post('/audit/verify');
      addToast(res.data.message, 'success', 'Admin Chain Verification Complete');
      await fetchAdminData();
    } catch (err) {
      addToast('Verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        <div className="h-24 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
          <div className="h-64 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">
      {/* Admin Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
              CPO Governance
            </span>
            <span className="text-xs font-mono text-zinc-500">
              DB: {data?.dbStatus?.mode} (ReplicaSet: {String(data?.dbStatus?.isReplicaSet)})
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Governance Command Centre
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Organization-wide consent telemetry, policy version lineage, and cryptographic SHA-256
            audit chain verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunVerification}
            disabled={verifying}
            className="px-3.5 py-2 rounded-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Scanning Ledger...' : 'Verify SHA-256 Chain'}</span>
          </button>
          <Link
            to="/admin/notices"
            className="px-3.5 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 transition-opacity"
          >
            <span>Publish Privacy Notice</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Unified 4-Column Admin Telemetry Strip */}
      <div className="enterprise-card grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/80">
        <Link
          to="/admin/users"
          className="p-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors block"
        >
          <span className="text-xs text-zinc-500 block">Registered Subjects</span>
          <p className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
            {metrics.totalRegisteredUsers}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            Inspect User Directory →
          </span>
        </Link>

        <Link
          to="/admin/integrity"
          className="p-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors block"
        >
          <span className="text-xs text-zinc-500 block">Audit Chain Status</span>
          <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.auditIntegrityStatus}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block font-mono">
            {metrics.totalAuditEvents} blocks →
          </span>
        </Link>

        <Link
          to="/admin/notices"
          className="p-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors block"
        >
          <span className="text-xs text-zinc-500 block">Active Policy Version</span>
          <p className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            v{metrics.currentNoticeVersion}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            Manage Activation →
          </span>
        </Link>

        <Link
          to="/notices/compare"
          className="p-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors block"
        >
          <span className="text-xs text-zinc-500 block">Policy Diff Engine</span>
          <p className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            v1.0 ↔ v2.0
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            Side-by-Side Diff →
          </span>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 enterprise-card p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
            Preference Category Opt-In Volume
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Active user consents per category across the organization
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.consentDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#71717a" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '0.375rem',
                    color: '#fafafa',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Enabled Users" radius={[4, 4, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 enterprise-card p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
            Global Consent Posture
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Distribution of granted, withdrawn, and default opt-out states
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.statusDistribution || []).map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '0.375rem',
                    color: '#fafafa',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Audit Stream */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Organization-Wide Activity Stream
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              User-initiated preference updates and administrative policy sync events
            </p>
          </div>
          <Link
            to="/audit-history"
            className="text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:opacity-80"
          >
            Full Audit Explorer →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80 text-[11px] font-medium text-zinc-500">
                <th className="py-2.5 px-4">Audit ID</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Transition</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Source</th>
                <th className="py-2.5 px-4">SHA-256 Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {(data?.recentAuditActivity || []).map((ev) => (
                <tr key={ev.auditId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                  <td className="py-2.5 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    <Link to={`/audit-history/${ev.auditId}`} className="hover:underline">
                      {ev.auditId}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {ev.userId?.name || 'System'}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">
                    {ev.preferenceName}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                    {ev.previousValue} → {ev.newValue}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {ev.action}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                      {ev.source}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-500">
                    {ev.eventHash?.slice(0, 20)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
