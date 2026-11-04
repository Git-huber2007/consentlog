import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  FileText,
  Lock,
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  Database,
  Sparkles,
  GitCompare,
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
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-8">
      {/* Admin Command Header */}
      <div className="bg-navy-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
              RBAC Protected: Admin Only
            </span>
            <span className="text-xs font-mono text-indigo-300">
              DB Mode: {data?.dbStatus?.mode} (ACID ReplicaSet: {String(data?.dbStatus?.isReplicaSet)})
            </span>
          </div>
          <h1 className="text-2xl font-extrabold mt-2">
            Chief Privacy Officer — Enterprise Governance Command Centre
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Full visibility across registered users, consent snapshots, privacy notice versions, and
            cryptographic SHA-256 audit chain integrity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunVerification}
            disabled={verifying}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Scanning Ledger...' : 'Verify SHA-256 Chain'}</span>
          </button>
          <Link
            to="/admin/notices"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish Privacy Notice</span>
          </Link>
        </div>
      </div>

      {/* Quick Admin Navigation Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">User Consent Directory</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {metrics.totalRegisteredUsers} Users
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
              Inspect User Preferences →
            </p>
          </div>
          <Users className="w-8 h-8 text-indigo-500" />
        </Link>

        <Link
          to="/admin/integrity"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Audit Chain Status</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.auditIntegrityStatus}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {metrics.totalAuditEvents} Chained Blocks →
            </p>
          </div>
          <Lock className="w-8 h-8 text-emerald-500" />
        </Link>

        <Link
          to="/admin/notices"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Active Policy Version</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Version {metrics.currentNoticeVersion}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
              Manage Activation →
            </p>
          </div>
          <FileText className="w-8 h-8 text-blue-500" />
        </Link>

        <Link
          to="/notices/compare"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Policy Diff Engine</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              v1.0 ↔ v2.0
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-1">
              Side-by-Side Comparison →
            </p>
          </div>
          <GitCompare className="w-8 h-8 text-violet-500" />
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Preference Category Opt-In Volume
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Active user consents per category across the organization
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.consentDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" name="Enabled Users" radius={[6, 6, 0, 0]}>
                  {(charts.consentDistribution || []).map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Global Consent Posture (Active vs Withdrawn vs Default Opt-Out)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Real-time distribution of preference states
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
      </div>

      {/* System Audit Stream */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Organization-Wide System & User Activity Stream
            </h3>
            <p className="text-xs text-slate-500">
              Includes both user-initiated preference updates and admin policy sync events
            </p>
          </div>
          <Link
            to="/audit-history"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Open Full Audit Explorer →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Transition</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">SHA-256 Event Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {(data?.recentAuditActivity || []).map((ev) => (
                <tr key={ev.auditId}>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    <Link to={`/audit-history/${ev.auditId}`} className="hover:underline">
                      {ev.auditId}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{ev.userId?.name || 'System'}</td>
                  <td className="py-2.5 px-3">{ev.preferenceName}</td>
                  <td className="py-2.5 px-3 font-mono">
                    {ev.previousValue} → {ev.newValue}
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{ev.action}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                      {ev.source}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
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

