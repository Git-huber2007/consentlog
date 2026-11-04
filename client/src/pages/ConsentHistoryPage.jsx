import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowUpDown,
  Eye,
  RefreshCw,
  ShieldCheck,
  Clock,
  Activity,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ConsentHistoryPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [statsData, setStatsData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedPreference, setSelectedPreference] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchAuditData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/audit/stats'),
        api.get('/audit/logs', {
          params: {
            search: search || undefined,
            userId: selectedUser !== 'all' ? selectedUser : undefined,
            preference: selectedPreference !== 'all' ? selectedPreference : undefined,
            action: selectedAction !== 'all' ? selectedAction : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sort: sortOrder,
            limit: 100,
          },
        }),
      ]);
      setStatsData(statsRes.data);
      setLogs(logsRes.data.logs || []);
      setTotalLogs(logsRes.data.total || 0);
    } catch (err) {
      addToast('Failed to load immutable consent audit history.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedUser, selectedPreference, selectedAction, startDate, endDate, sortOrder, addToast]);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  const handleRunVerification = async () => {
    setVerifying(true);
    try {
      const res = await api.post('/audit/verify');
      addToast(res.data.message, 'success', 'SHA-256 Chain Verified');
      await fetchAuditData();
    } catch (err) {
      addToast('Verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedUser('all');
    setSelectedPreference('all');
    setSelectedAction('all');
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
  };

  const stats = statsData?.stats || {};
  const timeline = statsData?.recentTimeline || [];
  const usersList = statsData?.usersList || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Immutable Consent Audit Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {stats.integrityStatus || 'Verified'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Append-only historical record of every consent change, chained via canonical SHA-256
            cryptographic hashing. No PUT, PATCH, or DELETE operations exist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunVerification}
            disabled={verifying}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Verifying Hashes...' : 'Run SHA-256 Chain Verification'}</span>
          </button>
        </div>
      </div>

      {/* 4 Audit KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Audit Events
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {stats.totalAuditEvents ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Permanent append-only records</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Today&apos;s Changes
          </span>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {stats.todaysChanges ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Recorded in last 24 hours</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Consent Grants
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.consentGrants ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Opt-ins & notice acceptances</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Consent Withdrawals
          </span>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {stats.consentWithdrawals ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Revocations & opt-outs</p>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Cryptographic Event Stream
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing latest {timeline.length} chained blocks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeline.slice(0, 4).map((item) => (
            <Link
              key={item.auditId}
              to={`/audit-history/${item.auditId}`}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  #{String(item.sequenceNumber).padStart(4, '0')} • {item.auditId}
                </span>
                <span className="text-slate-400">v{item.noticeVersion}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {item.preferenceName}
              </p>
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={`px-1.5 py-0.5 rounded font-semibold ${
                    item.action.includes('Withdrawn') || item.action.includes('Rejected')
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {item.action}
                </span>
                <span className="text-slate-400 font-mono">
                  {item.previousValue} → {item.newValue}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 truncate pt-1 border-t border-slate-200/60 dark:border-slate-800">
                Hash: {item.eventHash}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Search & Multi-Facet Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Search & Filter Append-Only Audit Table ({totalLogs} matching records)</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Audit ID, SHA-256 hash, preference, reason..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Filter by User (if Admin) */}
          {user?.role === 'admin' && (
            <div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Users</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter by Preference */}
          <div>
            <select
              value={selectedPreference}
              onChange={(e) => setSelectedPreference(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Preference Categories</option>
              <option value="Essential Cookies">Essential Cookies</option>
              <option value="Analytics Cookies">Analytics Cookies</option>
              <option value="Marketing Cookies">Marketing Cookies</option>
              <option value="Personalization">Personalization</option>
              <option value="Third-Party Data Sharing">Third-Party Data Sharing</option>
              <option value="Privacy Notice">Privacy Notice Acceptance</option>
            </select>
          </div>

          {/* Filter by Action */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Action Types</option>
              <option value="Consent Granted">Consent Granted</option>
              <option value="Consent Withdrawn">Consent Withdrawn</option>
              <option value="Notice Accepted">Notice Accepted</option>
              <option value="Bulk Consent Accepted">Bulk Consent Accepted</option>
              <option value="Optional Preferences Rejected">Optional Preferences Rejected</option>
              <option value="Initial Registration Defaults">Initial Registration Defaults</option>
              <option value="System Policy Sync">System Policy Sync</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Date Range Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500">Date Range Filter:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
          />
        </div>
      </div>

      {/* Detailed Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Seq / Audit ID</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Preference Category</th>
                <th className="py-3.5 px-4">State Transition</th>
                <th className="py-3.5 px-4">Action & Source</th>
                <th className="py-3.5 px-4">Notice</th>
                <th className="py-3.5 px-4">Cryptographic Hash (SHA-256)</th>
                <th className="py-3.5 px-4">UTC Timestamp</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading cryptographic audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No audit events match your current filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.auditId}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {log.auditId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Block #{String(log.sequenceNumber).padStart(5, '0')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {log.userId?.name || 'Enterprise User'}
                      </div>
                      <div className="text-[11px] text-slate-400">{log.userId?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.preferenceName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                        {log.reason}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.previousValue}
                      </span>
                      <span className="mx-1.5 text-slate-400">→</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          log.newValue.includes('Disabled')
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {log.newValue}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action.includes('Withdrawn') || log.action.includes('Rejected')
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : log.action.includes('System')
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {log.action}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Source: <strong>{log.source}</strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      v{log.noticeVersion}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      <div title={`Event Hash: ${log.eventHash}`}>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          curr:
                        </span>{' '}
                        {log.eventHash?.slice(0, 16)}...
                      </div>
                      <div title={`Previous Hash: ${log.previousHash}`}>
                        <span className="text-slate-400">prev:</span>{' '}
                        {log.previousHash?.slice(0, 16)}...
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)} UTC
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/audit-history/${log.auditId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsentHistoryPage;

