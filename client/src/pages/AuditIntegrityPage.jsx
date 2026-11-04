import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Zap,
  XCircle,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AuditIntegrityPage = () => {
  const { addToast } = useToast();
  const [latestReport, setLatestReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // Interactive Tamper Attack Simulator State
  const [simulating, setSimulating] = useState(false);
  const [tamperPayload, setTamperPayload] = useState('Enabled (UNAUTHORIZED_DBA_INJECTION)');
  const [simulationResult, setSimulationResult] = useState(null);

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

  const handleRunTamperSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/audit/simulate-tamper', {
        injectedNewValue: tamperPayload,
      });
      setSimulationResult(res.data);
      addToast(
        `Simulated tampering on Block #${res.data.targetBlock.sequenceNumber}: ${res.data.invalidatedDownstreamBlocks} downstream blocks immediately invalidated!`,
        'warning',
        'SHA-256 Cascade Failure Detected'
      );
    } catch (err) {
      addToast('Failed to run tamper simulation.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Precision Header */}
      <div className="p-5 rounded-lg bg-[#0B0F17] text-white border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              SHA-256 CRYPTOGRAPHIC VERIFIER & TAMPER LAB
            </span>
          </div>
          <h1 className="text-xl font-bold mt-1">
            Append-Only Audit Ledger Integrity & Cascade Verification
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
            Recomputes the canonical SHA-256 digest of every historical `ConsentLog` block from
            Genesis (#1) through Head to prove zero unauthorized mutation.
          </p>
        </div>

        <button
          onClick={handleRunIntegrityCheck}
          disabled={running}
          className="px-4 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Scanning Chain...' : 'Execute Full SHA-256 Verification'}</span>
        </button>
      </div>

      {/* Latest Verification Status Card */}
      {latestReport && (
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 enterprise-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                INTEGRITY STATUS INDICATOR
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {latestReport.verificationId}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-md ${
                  latestReport.verificationStatus === 'Verified'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {latestReport.verificationStatus}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {new Date(latestReport.verificationDate).toISOString().slice(0, 19)}Z (
                  {latestReport.executionTimeMs}ms)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                <span className="font-mono text-[9px] font-bold uppercase text-slate-400">
                  TOTAL BLOCKS
                </span>
                <p className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {latestReport.totalRecords}
                </p>
              </div>
              <div className="p-3 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-center">
                <span className="font-mono text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  VERIFIED
                </span>
                <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {latestReport.verifiedRecords}
                </p>
              </div>
              <div className="p-3 rounded-md bg-rose-500/5 border border-rose-500/20 text-center">
                <span className="font-mono text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400">
                  TAMPERED
                </span>
                <p className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {latestReport.failedRecords}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-lg bg-[#0B0F17] text-slate-100 border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-indigo-400 font-bold flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                CRYPTOGRAPHIC CHAIN ANCHORS
              </span>
              <span className="text-emerald-400 text-[10px]">CANONICAL SHA-256</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">GENESIS SEED HASH (BLOCK #0):</span>
              <p className="text-slate-300 break-all text-[11px]">{latestReport.genesisHash}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">
                CURRENT HEAD HASH (BLOCK #{latestReport.totalRecords}):
              </span>
              <p className="text-emerald-400 font-semibold break-all text-[11px]">
                {latestReport.headHash}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">CANONICAL SERIALIZATION FORMULA:</span>
              <p className="text-indigo-300 text-[11px]">
                SHA256(JSON.stringify(&#123; auditId, sequenceNumber, userId, preferenceName,
                previousValue, newValue, action, noticeVersion, source, reason, timestamp,
                previousHash &#125;))
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Interactive Cryptographic Tamper Attack Simulator */}
      <div className="enterprise-card p-5 space-y-4 border-l-2 border-l-amber-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                READ-ONLY SANDBOX LAB
              </span>
              <span className="font-mono text-xs text-slate-400">
                ZERO DATABASE MUTATION
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Interactive SHA-256 Tamper Attack Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate what happens if a rogue attacker attempts to alter a single historical consent
              value in the middle of the chain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={tamperPayload}
              onChange={(e) => setTamperPayload(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs w-64"
              placeholder="Injected rogue value..."
            />
            <button
              type="button"
              onClick={handleRunTamperSimulation}
              disabled={simulating}
              className="px-3.5 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{simulating ? 'Simulating...' : 'Simulate Tamper Attack'}</span>
            </button>
          </div>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-md bg-[#0B0F17] text-slate-100 border border-rose-500/40 font-mono text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                SIMULATION RESULT: TAMPERING DETECTED ON BLOCK #
                {simulationResult.targetBlock.sequenceNumber} (
                {simulationResult.targetBlock.auditId})
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                {simulationResult.invalidatedDownstreamBlocks} OF{' '}
                {simulationResult.totalBlocksInChain} BLOCKS INVALIDATED
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">
                  LEGITIMATE STORED VALUE ({simulationResult.targetBlock.preferenceName}):
                </span>
                <p className="text-emerald-400 font-bold">
                  {simulationResult.targetBlock.legitimateValue}
                </p>
                <span className="text-slate-400 block mt-2">STORED SHA-256 EVENT HASH:</span>
                <p className="text-emerald-300 break-all">
                  {simulationResult.targetBlock.storedEventHash}
                </p>
              </div>

              <div className="p-3 rounded bg-rose-950/20 border border-rose-500/30">
                <span className="text-rose-300 block">SIMULATED ROGUE INJECTION:</span>
                <p className="text-rose-400 font-bold">
                  {simulationResult.targetBlock.simulatedTamperedValue}
                </p>
                <span className="text-rose-300 block mt-2">
                  RECOMPUTED SHA-256 HASH (100% AVALANCHE DIVERGENCE):
                </span>
                <p className="text-rose-400 break-all">
                  {simulationResult.targetBlock.recomputedTamperedHash}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">
                Downstream Cascade Chain Breakage:
              </span>
              <div className="grid sm:grid-cols-3 gap-2">
                {simulationResult.cascadeImpacts.map((imp) => (
                  <div
                    key={imp.auditId}
                    className="p-2 rounded bg-slate-900 border border-rose-500/30 text-[10px]"
                  >
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>BLK #{imp.sequenceNumber}</span>
                      <span>{imp.status}</span>
                    </div>
                    <div className="text-slate-400 truncate mt-0.5">{imp.auditId}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Threat Model & Production Append-Only Guarantees */}
      <div className="enterprise-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Threat Model & Production Append-Only Protections
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          While SHA-256 hash chaining reliably detects single-record tampering, sequence gaps, and
          application-layer mutations,{' '}
          <strong>
            it does not independently prevent a privileged database administrator (DBA) with raw
            root storage access from rewriting an entire chain from Genesis
          </strong>
          . In production enterprise deployments, ConsentLog pairs internal SHA-256 hash chaining
          with:
        </p>

        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <p className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              01 // EXTERNAL CHECKPOINTS
            </p>
            <p className="font-semibold text-slate-900 dark:text-white mt-1">
              RFC 3161 & WORM Anchoring
            </p>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Anchoring hourly `headHash` digests to AWS S3 Object Lock (Compliance Mode) or an
              external transparency ledger.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <p className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              02 // LEAST-PRIVILEGE DB ROLES
            </p>
            <p className="font-semibold text-slate-900 dark:text-white mt-1">
              Separated Write Credentials
            </p>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Restricting the application MongoDB user to `insert` and `find` privileges on
              `consentlogs`, revoking `update` and `remove`.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <p className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
              03 // HSM HARDWARE SIGNING
            </p>
            <p className="font-semibold text-slate-900 dark:text-white mt-1">
              KMS Asymmetric Signatures
            </p>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Signing each block hash with a non-exportable AWS KMS or HashiCorp Vault asymmetric
              key.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Run History Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Historical Audit Verification Ledger ({history.length} Runs)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] font-bold uppercase text-slate-500">
                <th className="py-2.5 px-4">Verification ID</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Blocks Verified</th>
                <th className="py-2.5 px-4">Chain Head Digest</th>
                <th className="py-2.5 px-4">Auditor</th>
                <th className="py-2.5 px-4">UTC Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 font-mono text-[11px]">
              {history.map((h) => (
                <tr key={h.verificationId}>
                  <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {h.verificationId}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      {h.verificationStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 tabular-nums">
                    {h.verifiedRecords}/{h.totalRecords} (Fail: {h.failedRecords})
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{h.headHash?.slice(0, 24)}...</td>
                  <td className="py-2.5 px-4 font-sans font-medium">{h.triggeredBy}</td>
                  <td className="py-2.5 px-4 text-slate-500 tabular-nums">
                    {new Date(h.verificationDate).toISOString().replace('T', ' ').slice(0, 19)}Z
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
