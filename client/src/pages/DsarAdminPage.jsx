import React, { useState, useEffect } from 'react';
import {
  UserX,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const DsarAdminPage = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDsarRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dsar/requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      addToast('Could not load DSAR requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDsarRequests();
  }, []);

  const handleProcess = async (id, action) => {
    setProcessingId(id);
    try {
      const res = await api.post(`/admin/dsar/requests/${id}/process`, { action });
      addToast(res.data.message, 'success');
      fetchDsarRequests();
    } catch (err) {
      addToast(err.response?.data?.message || 'Processing failed.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(
    (r) =>
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      r.anonymizedIdentifier?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <UserX className="size-5 text-rose-500" />
            <span>DSAR & Article 17 Erasure Requests</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Review and execute Data Subject Right-to-Erasure requests with permanent cryptographic pseudonymous anonymization.
          </p>
        </div>

        <button
          onClick={fetchDsarRequests}
          disabled={loading}
          className="h-8 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="luxury-card p-4 relative overflow-hidden bg-gradient-to-b from-indigo-500/[0.05] dark:from-indigo-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Requests</span>
          <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block tabular-nums">
            {requests.length}
          </span>
        </div>
        <div className="luxury-card p-4 relative overflow-hidden bg-gradient-to-b from-amber-500/[0.05] dark:from-amber-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <span className="text-xs text-amber-600 dark:text-amber-400 block font-bold">Pending Review</span>
          <span className="font-mono text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block tabular-nums">
            {pendingCount}
          </span>
        </div>
        <div className="luxury-card p-4 relative overflow-hidden bg-gradient-to-b from-emerald-500/[0.05] dark:from-emerald-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-bold">Completed & Anonymized</span>
          <span className="font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="relative max-w-sm">
            <Search className="size-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search data subjects or IDs..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No DSAR erasure requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4">Data Subject</th>
                  <th className="py-2.5 px-4">Jurisdiction</th>
                  <th className="py-2.5 px-4">Type & Reason</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Submitted</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {r.userName}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-500">
                        {r.userEmail}
                      </div>
                      {r.anonymizedIdentifier && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                          Pseudonym: {r.anonymizedIdentifier}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {r.jurisdiction}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-semibold uppercase text-[10px] tracking-wide text-rose-600 dark:text-rose-400 block">
                        {r.requestType}
                      </span>
                      <p className="text-zinc-500 text-[11px] truncate" title={r.reason}>
                        {r.reason}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          r.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : r.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleProcess(r._id, 'approve')}
                            disabled={processingId === r._id}
                            className="h-7 px-2.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium transition-colors"
                          >
                            {processingId === r._id ? 'Processing...' : 'Anonymize'}
                          </button>
                          <button
                            onClick={() => handleProcess(r._id, 'reject')}
                            disabled={processingId === r._id}
                            className="h-7 px-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {r.processedBy ? `By ${r.processedBy}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DsarAdminPage;
