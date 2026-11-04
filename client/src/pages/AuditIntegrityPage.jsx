import React, { useState, useEffect } from 'react';
import {
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
  const [, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

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
        `Simulated tampering on Block #${res.data.targetBlock.sequenceNumber}: ${res.data.invalidatedDownstreamBlocks} downstream blocks invalidated.`,
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Cryptographic Verifier & Tamper Lab
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl">
            Recomputes the canonical SHA-256 digest of every historical ConsentLog block from
            Genesis (#1) through Head to verify zero unauthorized mutation.
          </p>
        </div>

        <button
          onClick={handleRunIntegrityCheck}
          disabled={running}
          className="px-4 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Scanning Chain...' : 'Execute Full SHA-256 Verification'}</span>
        </button>
      </div>

      {/* Latest Verification Status Card */}
      {latestReport && (
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 enterprise-card p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium">Latest Chain Verification</span>
              <span className="font-mono">{latestReport.verificationId}</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-md ${
                  latestReport.verificationStatus === 'Verified'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {latestReport.verificationStatus}
                </h2>
                <p className="text-xs text-zinc-500 font-mono">
                  {new Date(latestReport.verificationDate).toISOString().slice(0, 19)}Z (
                  {latestReport.executionTimeMs}ms)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md">
              <div className="p-3 text-center">
                <span className="text-[11px] text-zinc-500 block">Total</span>
                <p className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {latestReport.totalRecords}
                </p>
              </div>
              <div className="p-3 text-center">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">
                  Verified
                </span>
                <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {latestReport.verifiedRecords}
                </p>
              </div>
              <div className="p-3 text-center">
                <span className="text-[11px] text-rose-600 dark:text-rose-400 block">Tampered</span>
                <p className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {latestReport.failedRecords}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-lg bg-zinc-950 text-zinc-100 border border-zinc-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-200 font-semibold flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Cryptographic Chain Anchors
              </span>
              <span className="text-emerald-400 text-[11px]">SHA-256</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Genesis Seed (Block #0):</span>
              <p className="text-zinc-300 break-all text-[11px]">{latestReport.genesisHash}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">
                Current Head (Block #{latestReport.totalRecords}):
              </span>
              <p className="text-emerald-400 font-semibold break-all text-[11px]">
                {latestReport.headHash}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">Canonical Input Payload:</span>
              <p className="text-zinc-300 text-[11px]">
                SHA256(JSON.stringify(&#123; auditId, sequenceNumber, userId, preferenceName,
                previousValue, newValue, action, noticeVersion, source, reason, timestamp,
                previousHash &#125;))
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Cryptographic Tamper Attack Simulator */}
      <div className="enterprise-card p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                Read-Only Sandbox
              </span>
              <span className="font-mono text-xs text-zinc-500">Zero Database Mutation</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5">
              Interactive SHA-256 Tamper Attack Simulator
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Simulate what happens if an unauthorized actor alters a single historical consent
              value in the middle of the chain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={tamperPayload}
              onChange={(e) => setTamperPayload(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-900 dark:text-zinc-100 w-64 outline-none"
              placeholder="Injected rogue value..."
            />
            <button
              type="button"
              onClick={handleRunTamperSimulation}
              disabled={simulating}
              className="px-3.5 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{simulating ? 'Simulating...' : 'Simulate Tamper Attack'}</span>
            </button>
          </div>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-md bg-zinc-950 text-zinc-100 border border-rose-500/40 font-mono text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Tampering Detected on Block #{simulationResult.targetBlock.sequenceNumber} (
                {simulationResult.targetBlock.auditId})
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                {simulationResult.invalidatedDownstreamBlocks} of{' '}
                {simulationResult.totalBlocksInChain} blocks invalidated
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block">
                  Legitimate Stored Value ({simulationResult.targetBlock.preferenceName}):
                </span>
                <p className="text-emerald-400 font-semibold">
                  {simulationResult.targetBlock.legitimateValue}
                </p>
                <span className="text-zinc-400 block mt-2">Stored SHA-256 Event Hash:</span>
                <p className="text-emerald-300 break-all">
                  {simulationResult.targetBlock.storedEventHash}
                </p>
              </div>

              <div className="p-3 rounded bg-rose-950/20 border border-rose-500/30">
                <span className="text-rose-300 block">Simulated Rogue Injection:</span>
                <p className="text-rose-400 font-semibold">
                  {simulationResult.targetBlock.simulatedTamperedValue}
                </p>
                <span className="text-rose-300 block mt-2">
                  Recomputed SHA-256 Hash (Avalanche Divergence):
                </span>
                <p className="text-rose-400 break-all">
                  {simulationResult.targetBlock.recomputedTamperedHash}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400 block">
                Downstream Cascade Chain Breakage:
              </span>
              <div className="grid sm:grid-cols-3 gap-2">
                {simulationResult.cascadeImpacts.map((imp) => (
                  <div
                    key={imp.auditId}
                    className="p-2.5 rounded bg-zinc-900 border border-rose-500/30 text-[11px]"
                  >
                    <div className="flex justify-between text-rose-400 font-semibold">
                      <span>BLK #{imp.sequenceNumber}</span>
                      <span>{imp.status}</span>
                    </div>
                    <div className="text-zinc-400 truncate mt-0.5">{imp.auditId}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Threat Model & Production Append-Only Guarantees */}
      <div className="enterprise-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Threat Model & Production Append-Only Controls
        </h3>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          While SHA-256 hash chaining reliably detects single-record tampering, sequence gaps, and
          application-layer mutations, it does not independently prevent a privileged database
          administrator with raw storage access from rewriting an entire chain from Genesis. In
          production deployments, ConsentLog pairs internal SHA-256 hash chaining with three
          infrastructure controls:
        </p>

        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              RFC 3161 & WORM Anchoring
            </p>
            <p className="text-zinc-500 mt-1 leading-relaxed">
              Anchoring hourly headHash digests to AWS S3 Object Lock (Compliance Mode) or an
              external transparency ledger.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              Separated Write Credentials
            </p>
            <p className="text-zinc-500 mt-1 leading-relaxed">
              Restricting the application MongoDB role to insert and find privileges on
              consentlogs, revoking update and remove.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              KMS Asymmetric Signatures
            </p>
            <p className="text-zinc-500 mt-1 leading-relaxed">
              Signing each block digest with a non-exportable AWS KMS or HashiCorp Vault asymmetric
              key.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Run History Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Historical Verification Runs ({history.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80 text-[11px] font-medium text-zinc-500">
                <th className="py-2.5 px-4">Verification ID</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Blocks Verified</th>
                <th className="py-2.5 px-4">Chain Head Digest</th>
                <th className="py-2.5 px-4">Triggered By</th>
                <th className="py-2.5 px-4">UTC Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-mono text-[11px]">
              {history.map((h) => (
                <tr key={h.verificationId}>
                  <td className="py-2.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {h.verificationId}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                      {h.verificationStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 tabular-nums text-zinc-700 dark:text-zinc-300">
                    {h.verifiedRecords}/{h.totalRecords} (Fail: {h.failedRecords})
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500">{h.headHash?.slice(0, 24)}...</td>
                  <td className="py-2.5 px-4 font-sans font-medium text-zinc-700 dark:text-zinc-300">
                    {h.triggeredBy}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500 tabular-nums">
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
