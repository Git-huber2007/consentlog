import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Database,
  Server,
  FileCode2,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AuditIntegrityPage = () => {
  const { addToast } = useToast();
  const [latestReport, setLatestReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const loadVerificationData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setLatestReport(res.data.latestVerification);
      setHistory(res.data.verificationHistory || []);
    } catch (err) {
      addToast('Failed to load audit verification history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationData();
  }, []);

  const handleRunIntegrityCheck = async () => {
    setRunning(true);
    try {
      const res = await api.post('/audit/verify');
      setLatestReport(res.data.report);
      setHistory(res.data.history || []);
      addToast(res.data.message, 'success', 'Cryptographic Scan Complete');
    } catch (err) {
      addToast('Failed to execute SHA-256 verification.', 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-navy-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              SHA-256 Cryptographic Hash Chain Verifier
            </span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">
            Append-Only Audit Ledger Integrity & Security Architecture
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Recomputes the canonical SHA-256 hash of every historical `ConsentLog` document from
            Genesis Block #1 through the current Chain Head to verify zero tampering or sequence
            deletion.
          </p>
        </div>

        <button
          onClick={handleRunIntegrityCheck}
          disabled={running}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-2 shrink-0 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Verifying Entire Chain...' : 'Run Full Chain Integrity Scan'}</span>
        </button>
      </div>

      {/* Latest Verification Status Card */}
      {latestReport && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audit Integrity Status Indicator
              </span>
              <span className="font-mono text-xs text-slate-400">{latestReport.verificationId}</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-3.5 rounded-2xl ${
                  latestReport.verificationStatus === 'Verified'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {latestReport.verificationStatus}
                </h2>
                <p className="text-xs text-slate-500">
                  Executed on {new Date(latestReport.verificationDate).toLocaleString()} (
                  {latestReport.executionTimeMs}ms)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Blocks</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {latestReport.totalRecords}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-600">Verified</span>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {latestReport.verifiedRecords}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                <span className="text-[10px] font-bold uppercase text-rose-600">Failed</span>
                <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  {latestReport.failedRecords}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-indigo-400 font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                CRYPTOGRAPHIC CHAIN ANCHORS
              </span>
              <span className="text-emerald-400">CANONICAL SHA-256</span>
            </div>
            <div>
              <span className="text-slate-400 block">Genesis Seed Hash (Block #0):</span>
              <p className="text-slate-300 break-all">{latestReport.genesisHash}</p>
            </div>
            <div>
              <span className="text-slate-400 block">
                Current Head Hash (Block #{latestReport.totalRecords}):
              </span>
              <p className="text-emerald-400 font-bold break-all">{latestReport.headHash}</p>
            </div>
            <div>
              <span className="text-slate-400 block">Canonical Hash Formula:</span>
              <p className="text-indigo-300">
                SHA256(JSON.stringify(&#123; auditId, sequenceNumber, userId, preferenceName,
                previousValue, newValue, action, noticeVersion, source, reason, timestamp,
                previousHash &#125;))
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Architectural Security Documentation (Required by Prompt) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Threat Model & Production Append-Only Guarantees
          </h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>How Server-Side SHA-256 Hash Chaining Works:</strong> Every consent event is
          serialized into a deterministic canonical JSON payload and hashed with SHA-256 alongside
          the immediately preceding record&apos;s `eventHash`. If any historical record&apos;s
          timestamp, preference value, or user reference is modified—or if a record is deleted—the
          recomputed hash diverges and breaks every subsequent block in the chain.
        </p>

        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Important Cryptographic Limitation & Production Hardening</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            While SHA-256 hash chaining reliably detects single-record tampering, sequence gaps, and
            unauthorized application mutations, <strong>it does not independently prevent a privileged database administrator (DBA) with raw root storage access from altering a historical record and recalculating the entire subsequent hash chain</strong>.
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong>Stronger Production Protections:</strong> In regulated enterprise deployments,
            ConsentLog pairs internal SHA-256 chaining with:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-1">
            <li>
              <strong>External Hash Checkpoints (RFC 3161 / Blockchain Anchoring):</strong>{' '}
              Publishing the hourly `headHash` to an external immutable ledger or WORM (Write-Once-Read-Many) S3 Object Lock bucket.
            </li>
            <li>
              <strong>Separated Database Credentials:</strong> Granting the Express application a
              MongoDB role with `insert` and `find` privileges only on the `consentlogs` collection
              (revoking `update`, `remove`, and `dropCollection` at the database engine level).
            </li>
            <li>
              <strong>HSM / KMS Digital Signatures:</strong> Signing each block hash with an AWS KMS
              or HashiCorp Vault asymmetric private key whose material never leaves the hardware
              security module.
            </li>
          </ul>
        </div>
      </div>

      {/* Verification Run History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Historical Audit Verification Runs
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500">
                <th className="py-3 px-4">Verification ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Records Verified</th>
                <th className="py-3 px-4">Chain Head Hash</th>
                <th className="py-3 px-4">Triggered By</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {history.map((h) => (
                <tr key={h.verificationId}>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {h.verificationId}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                      {h.verificationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {h.verifiedRecords} / {h.totalRecords} (Failed: {h.failedRecords})
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {h.headHash?.slice(0, 24)}...
                  </td>
                  <td className="py-3 px-4 font-semibold">{h.triggeredBy}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(h.verificationDate).toLocaleString()}
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

export default AuditIntegrityPage;

