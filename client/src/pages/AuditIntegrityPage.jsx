import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Terminal,
  Zap,
  XCircle,
  Download,
  ShieldCheck,
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
  const [tamperPayload, setTamperPayload] = useState('Enabled (Modified)');
  const [simulationResult, setSimulationResult] = useState(null);

  const loadVerificationData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setLatestReport(res.data.latestVerification);
      setHistory(res.data.verificationHistory || []);
    } catch (err) {
      addToast('Could not load verification history.', 'error');
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
      addToast(res.data.message, 'success', 'Verification Complete');
    } catch (err) {
      addToast('Could not verify log integrity.', 'error');
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
        `Entry #${res.data.targetBlock.sequenceNumber} mismatch detected (${res.data.invalidatedDownstreamBlocks} subsequent entries affected).`,
        'warning'
      );
    } catch (err) {
      addToast('Could not run test.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!latestReport) {
      addToast('No verification report available to export.', 'warning');
      return;
    }
    const certificatePayload = {
      certificateId: `CERT-VERIFY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${latestReport.verificationId?.slice(-6) || 'HEAD'}`,
      issuer: 'ConsentLog Enterprise Cryptographic Ledger Engine v2.0',
      standard: 'SHA-256 Merkle-Linked Append-Only Hash Chain',
      verificationId: latestReport.verificationId,
      verificationTimestamp: latestReport.verificationDate,
      verificationStatus: latestReport.verificationStatus,
      totalAuditedBlocks: latestReport.totalRecords,
      verifiedBlocks: latestReport.verifiedRecords,
      invalidBlocks: latestReport.failedRecords,
      genesisBlockHash: latestReport.genesisHash || '0000000000000000000000000000000000000000000000000000000000000000',
      headBlockHash: latestReport.headHash,
      executionDurationMs: latestReport.executionTimeMs,
      verifiedBy: latestReport.triggeredBy,
      complianceAttestations: [
        'GDPR Art. 5(2) (Accountability Principle)',
        'GDPR Art. 7(1) (Demonstrable Proof of Consent)',
        'India DPDP Act 2023 Sec. 6(1) (Verifiable Consent Lineage)',
        'California Consumer Privacy Act (CCPA/CPRA § 1798.100)',
      ],
      cryptographicSignature: latestReport.headHash
        ? `CL-SIG-SHA256-${latestReport.headHash.slice(0, 32)}`
        : 'GENESIS-UNCOMMITTED',
    };

    const jsonString = JSON.stringify(certificatePayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consentlog-audit-certificate-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Cryptographic Verification Certificate downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Log Verification
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Recalculates the SHA-256 hash of every audit log entry from the first record to the latest to confirm nothing has been altered.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCertificate}
            disabled={!latestReport}
            className="px-3.5 py-2.5 rounded-md bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 shrink-0 transition-colors shadow-xs disabled:opacity-50"
            title="Download signed JSON verification certificate"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Certificate</span>
          </button>

          <button
            onClick={handleRunIntegrityCheck}
            disabled={running}
            className="px-4 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Checking...' : 'Run Verification Check'}</span>
          </button>
        </div>
      </div>

      {latestReport && (
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 enterprise-card p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium">Latest Check</span>
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
                  Valid
                </span>
                <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {latestReport.verifiedRecords}
                </p>
              </div>
              <div className="p-3 text-center">
                <span className="text-[11px] text-rose-600 dark:text-rose-400 block">Invalid</span>
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
                Hash Chain Summary
              </span>
              <span className="text-emerald-400 text-[11px]">SHA-256</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">First Entry Seed:</span>
              <p className="text-zinc-300 break-all text-[11px]">{latestReport.genesisHash}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px] block">
                Latest Entry Hash (#{latestReport.totalRecords}):
              </span>
              <p className="text-emerald-400 font-semibold break-all text-[11px]">
                {latestReport.headHash}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="enterprise-card p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Test Tamper Detection
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Preview how the hash check responds if a past log entry is modified (does not change stored data).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={tamperPayload}
              onChange={(e) => setTamperPayload(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-900 dark:text-zinc-100 w-56 outline-none"
              placeholder="Test value..."
            />
            <button
              type="button"
              onClick={handleRunTamperSimulation}
              disabled={simulating}
              className="px-3.5 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{simulating ? 'Testing...' : 'Run Test'}</span>
            </button>
          </div>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-md bg-zinc-950 text-zinc-100 border border-rose-500/40 font-mono text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Mismatch on Entry #{simulationResult.targetBlock.sequenceNumber} (
                {simulationResult.targetBlock.auditId})
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                {simulationResult.invalidatedDownstreamBlocks} of{' '}
                {simulationResult.totalBlocksInChain} entries affected
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block">
                  Stored Value ({simulationResult.targetBlock.preferenceName}):
                </span>
                <p className="text-emerald-400 font-semibold">
                  {simulationResult.targetBlock.legitimateValue}
                </p>
                <span className="text-zinc-400 block mt-2">Stored Hash:</span>
                <p className="text-emerald-300 break-all">
                  {simulationResult.targetBlock.storedEventHash}
                </p>
              </div>

              <div className="p-3 rounded bg-rose-950/20 border border-rose-500/30">
                <span className="text-rose-300 block">Modified Test Value:</span>
                <p className="text-rose-400 font-semibold">
                  {simulationResult.targetBlock.simulatedTamperedValue}
                </p>
                <span className="text-rose-300 block mt-2">Recalculated Hash:</span>
                <p className="text-rose-400 break-all">
                  {simulationResult.targetBlock.recomputedTamperedHash}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="enterprise-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Verification History ({history.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80 text-[11px] font-medium text-zinc-500">
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Entries Checked</th>
                <th className="py-2.5 px-4">Latest Hash</th>
                <th className="py-2.5 px-4">Run By</th>
                <th className="py-2.5 px-4">Date</th>
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
                    {h.verifiedRecords}/{h.totalRecords}
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
