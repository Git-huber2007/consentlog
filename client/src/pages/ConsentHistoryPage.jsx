import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Lock,
  ArrowUpDown,
  Eye,
  RefreshCw,
  Activity,
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
    a.download = `ConsentLog-Audit-Ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${logs.length} SHA-256 audit records to CSV.`, 'success', 'CSV Ledger Export');
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="enterprise-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {stats.integrityStatus || 'Verified'}
            </span>
            <span className="font-mono text-xs text-slate-400">
              APPEND-ONLY SHA-256 HASH CHAIN
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Immutable Consent Audit Ledger
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleRunVerification}
            disabled={verifying}
            className="px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Verifying Hashes...' : 'Verify SHA-256 Chain'}</span>
          </button>
        </div>
      </div>

      {/* 4 Audit KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="enterprise-card p-4 border-l-2 border-l-slate-600">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            TOTAL AUDIT BLOCKS
          </span>
          <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.totalAuditEvents ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Permanent append-only records</p>
        </div>

        <div className="enterprise-card p-4 border-l-2 border-l-indigo-500">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            24H EVENT VELOCITY
          </span>
          <p className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {stats.todaysChanges ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Recorded today (UTC)</p>
        </div>

        <div className="enterprise-card p-4 border-l-2 border-l-emerald-500">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            CONSENT GRANTS
          </span>
          <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {stats.consentGrants ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Opt-ins & policy acknowledgments</p>
        </div>

        <div className="enterprise-card p-4 border-l-2 border-l-rose-500">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            CONSENT WITHDRAWALS
          </span>
          <p className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            {stats.consentWithdrawals ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Revocations & opt-outs</p>
        </div>
      </div>

      {/* Recent Cryptographic Block Stream */}
      <div className="enterprise-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Latest Chained Blocks
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            HEAD STREAM ({timeline.length} BLOCKS)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {timeline.slice(0, 4).map((item) => (
            <Link
              key={item.auditId}
              to={`/audit-history/${item.auditId}`}
              className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  #{String(item.sequenceNumber).padStart(4, '0')} • {item.auditId}
                </span>
                <span className="text-slate-400">v{item.noticeVersion}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {item.preferenceName}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span
                  className={`px-1.5 py-0.2 rounded font-semibold ${
                    item.action.includes('Withdrawn') || item.action.includes('Rejected')
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {item.action}
                </span>
                <span className="text-slate-400">
                  {item.previousValue} → {item.newValue}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 truncate pt-1 border-t border-slate-200/60 dark:border-slate-800">
                sha256:{item.eventHash}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Multi-Facet Filter Bar */}
      <div className="enterprise-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>QUERY LEDGER ({totalLogs} MATCHING BLOCKS)</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by Audit ID, SHA-256 hash, category..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {user?.role === 'admin' && (
            <div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none"
              >
                <option value="all">All Subjects</option>
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
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Essential Cookies">Essential Cookies</option>
              <option value="Analytics Cookies">Analytics Cookies</option>
              <option value="Marketing Cookies">Marketing Cookies</option>
              <option value="Personalization">Personalization</option>
              <option value="Third-Party Data Sharing">Third-Party Data Sharing</option>
              <option value="Privacy Notice">Privacy Notice Acceptance</option>
            </select>
          </div>

          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none"
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
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="font-mono text-[10px] font-semibold uppercase text-slate-400">
            DATE WINDOW:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
          />
          <span className="text-slate-400">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
          />
        </div>
      </div>

      {/* High-Density Tabular Audit Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Block / Audit ID</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category & Reason</th>
                <th className="py-3 px-4">Transition</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Policy</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">UTC Timestamp</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-mono">
                    QUERYING CRYPTOGRAPHIC LEDGER...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No audit blocks match your filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.auditId}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        {log.auditId}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        BLK #{String(log.sequenceNumber).padStart(5, '0')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {log.userId?.name || 'Enterprise Subject'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {log.userId?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.preferenceName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                        {log.reason}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.previousValue}
                      </span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
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
                        className={`font-mono inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.action.includes('Withdrawn') || log.action.includes('Rejected')
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : log.action.includes('System')
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {log.action}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        SRC: {log.source}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      v{log.noticeVersion}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          curr:
                        </span>
                        <span>{log.eventHash?.slice(0, 14)}...</span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(log.eventHash, log.auditId)}
                          className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
                          title="Copy full SHA-256 hash"
                        >
                          {copiedId === log.auditId ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div>
                        <span className="text-slate-400">prev:</span>{' '}
                        {log.previousHash?.slice(0, 14)}...
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 tabular-nums">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}Z
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/audit-history/${log.auditId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono font-semibold text-[11px] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
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
