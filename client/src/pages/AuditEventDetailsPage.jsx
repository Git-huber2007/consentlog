import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Terminal,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AuditEventDetailsPage = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/audit/logs/${id}`);
        setData(res.data);
      } catch (err) {
        addToast(err.response?.data?.message || 'Audit record not found.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, addToast]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        <div className="h-96 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
      </div>
    );
  }

  if (!data?.log) {
    return (
      <div className="enterprise-card p-8 text-center space-y-4">
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Audit Event Not Found
        </p>
        <Link
          to="/audit-history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Audit Ledger</span>
        </Link>
      </div>
    );
  }

  const { log, chainContext } = data;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Verification Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/audit-history"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Audit Ledger</span>
        </Link>

        <div className="flex items-center gap-2">
          {chainContext?.integrityVerified ? (
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              SHA-256 Signature Verified
            </span>
          ) : (
            <span className="px-3 py-1 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-medium flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Hash Verification Alert
            </span>
          )}
        </div>
      </div>

      {/* Main Event Certificate Card */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-6 bg-zinc-900 dark:bg-zinc-950 text-white border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>Block #{String(log.sequenceNumber).padStart(6, '0')}</span>
              <span>·</span>
              <span>Append-Only Record</span>
            </div>
            <h1 className="text-2xl font-mono font-bold mt-1">{log.auditId}</h1>
          </div>
          <div className="text-left md:text-right font-mono text-xs text-zinc-400">
            <div>UTC Timestamp</div>
            <div className="text-zinc-100 font-semibold">{new Date(log.timestamp).toISOString()}</div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500">
              Consent State Modification
            </h3>
            <div className="p-4 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Preference Category</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {log.preferenceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Previous Value</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {log.previousValue}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">New Value</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {log.newValue}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Action Type</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {log.action}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Notice Version</span>
                <span className="font-mono font-semibold">v{log.noticeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Source</span>
                <span className="font-mono">{log.source}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500">
              Subject & Context Metadata
            </h3>
            <div className="p-4 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">User ID</span>
                <span className="font-mono">{log.userId?._id || log.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">User Name</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {log.userId?.name || 'Enterprise User'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email</span>
                <span className="font-mono">{log.userId?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Jurisdiction</span>
                <span className="font-medium">{log.userId?.jurisdiction || 'GDPR (EU)'}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block mb-1">Audit Note</span>
                <p className="text-xs text-zinc-800 dark:text-zinc-200">{log.reason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Hash Chain Verification Proof */}
        <div className="px-6 pb-6">
          <div className="p-5 rounded-md bg-zinc-950 text-zinc-100 border border-zinc-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Canonical SHA-256 Hash Chain Proof</span>
              </div>
              <span className="text-emerald-400 font-semibold text-[11px]">
                {chainContext?.hashMatches ? 'RECOMPUTED == STORED' : 'MISMATCH'}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-zinc-500 block">previousHash:</span>
                <p className="text-zinc-300 break-all">{log.previousHash}</p>
              </div>
              <div>
                <span className="text-zinc-500 block">eventHash (Stored):</span>
                <p className="text-emerald-400 break-all font-semibold">{log.eventHash}</p>
              </div>
              <div>
                <span className="text-zinc-500 block">Recomputed SHA-256 Digest:</span>
                <p className="text-zinc-200 break-all">{chainContext?.recomputedHash}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adjacent Chain Navigation */}
      <div className="grid sm:grid-cols-2 gap-4">
        {chainContext?.previousRecord ? (
          <Link
            to={`/audit-history/${chainContext.previousRecord.auditId}`}
            className="enterprise-card p-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
          >
            <span className="text-[11px] font-mono text-zinc-500">
              ← Previous Block (#{chainContext.previousRecord.sequenceNumber})
            </span>
            <p className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {chainContext.previousRecord.auditId}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {chainContext.previousRecord.preferenceName} ({chainContext.previousRecord.action})
            </p>
          </Link>
        ) : (
          <div className="enterprise-card p-4 text-xs text-zinc-500">
            Genesis Block Reached (Sequence #1)
          </div>
        )}

        {chainContext?.nextRecord ? (
          <Link
            to={`/audit-history/${chainContext.nextRecord.auditId}`}
            className="enterprise-card p-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors text-right"
          >
            <span className="text-[11px] font-mono text-zinc-500">
              Next Block (#{chainContext.nextRecord.sequenceNumber}) →
            </span>
            <p className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {chainContext.nextRecord.auditId}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {chainContext.nextRecord.preferenceName} ({chainContext.nextRecord.action})
            </p>
          </Link>
        ) : (
          <div className="enterprise-card p-4 text-xs text-zinc-500 text-right">
            Latest Chain Head Reached
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditEventDetailsPage;
