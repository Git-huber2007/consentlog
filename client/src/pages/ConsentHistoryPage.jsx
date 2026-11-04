import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Eye,
  RefreshCw,
  Download,
  Copy,
  Check,
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
  const [copiedId, setCopiedId] = useState(null);

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
      addToast('Could not load audit log.', 'error');
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
      addToast(res.data.message, 'success', 'Audit Log Verified');
      await fetchAuditData();
    } catch (err) {
      addToast('Verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportCsv = () => {
    if (!logs.length) return;
    const headers = [
      'SequenceNumber',
      'AuditID',
      'UserEmail',
      'PreferenceCategory',
      'PreviousValue',
      'NewValue',
      'Action',
      'NoticeVersion',
      'Source',
      'TimestampUTC',
      'PreviousHash',
      'EventHash',
    ];
    const rows = logs.map((l) => [
      l.sequenceNumber,
      l.auditId,
      l.userId?.email || '',
      `"${(l.preferenceName || '').replace(/"/g, '""')}"`,
      l.previousValue,
      l.newValue,
      l.action,
      l.noticeVersion,
      l.source,
      new Date(l.timestamp).toISOString(),
      l.previousHash,
      l.eventHash,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consentlog-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${logs.length} records to CSV.`, 'success');
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
  const usersList = statsData?.usersList || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Audit Log
            </h1>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {stats.integrityStatus || 'Verified'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Chronological log of all preference changes and privacy notice acceptances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="h-9 px-3 rounded-md bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"
          >
            <Download className="size-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleRunVerification}
            disabled={verifying}
            className="h-9 px-3.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90 text-xs font-medium flex items-center gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Checking...' : 'Verify Logs'}</span>
          </button>
        </div>
      </div>

      <div className="enterprise-card grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 sm:divide-x divide-zinc-200/80 dark:divide-zinc-800/80">
        <div className="p-4">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Total Entries
          </span>
          <p className="font-mono text-2xl font-semibold text-zinc-900 dark:text-white mt-1.5 tabular-nums">
            {stats.totalAuditEvents ?? 0}
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Today
          </span>
          <p className="font-mono text-2xl font-semibold text-zinc-900 dark:text-white mt-1.5 tabular-nums">
            {stats.todaysChanges ?? 0}
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Granted
          </span>
          <p className="font-mono text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 tabular-nums">
            {stats.consentGrants ?? 0}
          </p>
        </div>

        <div className="p-4">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Withdrawn
          </span>
          <p className="font-mono text-2xl font-semibold text-rose-600 dark:text-rose-400 mt-1.5 tabular-nums">
            {stats.consentWithdrawals ?? 0}
          </p>
        </div>
      </div>

      <div className="enterprise-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 tabular-nums">
            Showing {logs.length} of {totalLogs} entries
          </span>
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Reset filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2 relative">
            <Search className="size-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, hash, or category..."
              className="w-full h-8 pl-8 pr-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          {user?.role === 'admin' && (
            <div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs outline-none"
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

          <div>
            <select
              value={selectedPreference}
              onChange={(e) => setSelectedPreference(e.target.value)}
              className="w-full h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Essential Cookies">Essential Cookies</option>
              <option value="Analytics Cookies">Analytics Cookies</option>
              <option value="Marketing Cookies">Marketing Cookies</option>
              <option value="Personalization">Personalization</option>
              <option value="Third-Party Data Sharing">Third-Party Data Sharing</option>
              <option value="Privacy Notice">Privacy Notice</option>
            </select>
          </div>

          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs outline-none"
            >
              <option value="all">All Actions</option>
              <option value="Consent Granted">Consent Granted</option>
              <option value="Consent Withdrawn">Consent Withdrawn</option>
              <option value="Notice Accepted">Notice Accepted</option>
              <option value="Bulk Consent Accepted">Bulk Consent Accepted</option>
              <option value="Optional Preferences Rejected">Optional Preferences Rejected</option>
              <option value="Initial Registration Defaults">Initial Registration Defaults</option>
              <option value="System Policy Sync">System Policy Sync</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="w-full h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowUpDown className="size-3.5 text-zinc-500" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <span className="text-xs text-zinc-500">Date range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-7 px-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono"
          />
          <span className="text-zinc-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-7 px-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono"
          />
        </div>
      </div>

      <div className="enterprise-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Change</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Version</th>
                <th className="py-2.5 px-4">Hash</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80 text-xs">
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
                      <div className="h-2.5 w-14 bg-zinc-100 dark:bg-zinc-900 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
                      <div className="h-2.5 w-36 bg-zinc-100 dark:bg-zinc-900 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
                      <div className="h-2.5 w-44 bg-zinc-100 dark:bg-zinc-900 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5" />
                      <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      No matching log entries found.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.auditId}
                    className="hover:bg-zinc-50/90 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {log.auditId}
                      </div>
                      <div className="text-[10px] text-zinc-400 tabular-nums">
                        #{String(log.sequenceNumber).padStart(5, '0')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {log.userId?.name?.replace(/\s*\(.*?\)\s*/g, '') || 'User'}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {log.userId?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {log.preferenceName}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 max-w-xs">
                        {log.reason}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {log.previousValue}
                      </span>
                      <span className="mx-1 text-zinc-400">→</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-medium ${
                          log.newValue.includes('Disabled')
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {log.newValue}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          log.action.includes('Withdrawn') || log.action.includes('Rejected')
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : log.action.includes('System')
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                      v{log.noticeVersion}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <span>{log.eventHash?.slice(0, 14)}...</span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(log.eventHash, log.auditId)}
                          aria-label={`Copy hash for ${log.auditId}`}
                          className="relative p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          title="Copy full hash"
                        >
                          {copiedId === log.auditId ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 tabular-nums">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}Z
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/audit-history/${log.auditId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-[11px]"
                      >
                        <Eye className="size-3" />
                        <span>View</span>
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
