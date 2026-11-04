import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Hash,
  Clock,
  User,
  FileText,
  ArrowRight,
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
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!data?.log) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <p className="text-lg font-bold">Audit Event Not Found</p>
        <Link
          to="/audit-history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Immutable Consent History</span>
        </Link>

        <div className="flex items-center gap-2">
          {chainContext?.integrityVerified ? (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              SHA-256 Cryptographic Signature Verified
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Hash Verification Alert
            </span>
          )}
        </div>
      </div>

      {/* Main Event Certificate Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 bg-navy-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
              <span>SEQUENCE BLOCK #{String(log.sequenceNumber).padStart(6, '0')}</span>
              <span>•</span>
              <span>IMMUTABLE AUDIT RECORD</span>
            </div>
            <h1 className="text-2xl font-mono font-extrabold mt-1">{log.auditId}</h1>
          </div>
          <div className="text-left md:text-right font-mono text-xs text-slate-300">
            <div>Exact UTC Timestamp:</div>
            <div className="text-white font-bold">{new Date(log.timestamp).toISOString()}</div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Consent State Modification
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Preference Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {log.preferenceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Value:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {log.previousValue}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">New Value:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {log.newValue}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Action Type:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {log.action}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Privacy Notice Version:</span>
                <span className="font-mono font-bold">Version {log.noticeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Change Source:</span>
                <span className="font-semibold">{log.source}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Subject & Context Metadata
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="font-mono text-xs">{log.userId?._id || log.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User Name:</span>
                <span className="font-semibold">{log.userId?.name || 'Enterprise User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-xs">{log.userId?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jurisdiction:</span>
                <span className="font-semibold">{log.userId?.jurisdiction || 'GDPR (EU)'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Recorded Reason / Audit Note:</span>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                  {log.reason}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Hash Chain Verification Proof */}
        <div className="px-6 pb-6">
          <div className="p-5 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>CANONICAL SHA-256 HASH CHAIN PROOF</span>
              </div>
              <span className="text-emerald-400 font-bold">
                {chainContext?.hashMatches ? 'RECOMPUTED HASH == STORED HASH' : 'MISMATCH'}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block">
                  Previous Block Event Hash (previousHash):
                </span>
                <p className="text-amber-300 break-all">{log.previousHash}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Stored Block Event Hash (eventHash):</span>
                <p className="text-emerald-400 break-all font-bold">{log.eventHash}</p>
              </div>
              <div>
                <span className="text-slate-400 block">
                  Live Server-Side Recomputed SHA-256 Hash:
                </span>
                <p className="text-indigo-300 break-all">{chainContext?.recomputedHash}</p>
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
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">
                ← Previous Block (#{chainContext.previousRecord.sequenceNumber})
              </span>
              <p className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {chainContext.previousRecord.auditId}
              </p>
              <p className="text-xs text-slate-500">
                {chainContext.previousRecord.preferenceName} ({chainContext.previousRecord.action})
              </p>
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Genesis Block Reached (Sequence #1)
          </div>
        )}

        {chainContext?.nextRecord ? (
          <Link
            to={`/audit-history/${chainContext.nextRecord.auditId}`}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 flex items-center justify-between text-right"
          >
            <div className="w-full">
              <span className="text-[11px] font-bold uppercase text-slate-400">
                Next Block (#{chainContext.nextRecord.sequenceNumber}) →
              </span>
              <p className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {chainContext.nextRecord.auditId}
              </p>
              <p className="text-xs text-slate-500">
                {chainContext.nextRecord.preferenceName} ({chainContext.nextRecord.action})
              </p>
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-right">
            Latest Chain Head Reached
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditEventDetailsPage;

