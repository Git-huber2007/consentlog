import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Sliders,
  GitCompare,
  ArrowRight,
  CheckCircle2,
  Database,
  Sun,
  Moon,
  Terminal,
  FileCode2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [previewPrefs, setPreviewPrefs] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    personalization: true,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C14] text-slate-900 dark:text-slate-100 flex flex-col bg-architectural-grid">
      {/* Precision Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-[#0B0F17]/90 border-b border-slate-200/90 dark:border-slate-800/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center border border-indigo-400/30">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">ConsentLog</span>
              <span className="font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                v2.0-ENT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Open Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Deploy Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Architectural Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-200/90 dark:border-slate-800/90">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>REGULATORY ENGINE // GDPR • CCPA/CPRA • INDIA DPDP 2023 • ISO 27701</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-slate-950 dark:text-white">
              Cryptographic Consent & Preference Infrastructure.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Collect, customize, withdraw, and verify data subject consent through a centralized
              preference matrix backed by an append-only, SHA-256 hash-chained MongoDB ledger and
              clause-level policy version control.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <span>{user ? 'Enter Governance Console' : 'Launch Interactive Demo'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={user ? '/preferences' : '/register'}
                className="px-5 py-2.5 rounded-md bg-white dark:bg-[#0D1322] hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-800 transition-colors"
              >
                {user ? 'Configure Preferences' : 'Register Privacy-by-Default Subject'}
              </Link>
            </div>

            {/* Technical Spec Strip */}
            <div className="grid grid-cols-3 border border-slate-200/90 dark:border-slate-800/90 rounded-lg bg-white dark:bg-[#0D1322] divide-x divide-slate-200/90 dark:divide-slate-800/90 mt-8">
              <div className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  AUDIT CIPHER
                </p>
                <p className="font-mono text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  SHA-256
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Canonical Event Chaining</p>
              </div>
              <div className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  MUTATION SURFACE
                </p>
                <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  0 ENDPOINTS
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">PUT / PATCH / DELETE 403</p>
              </div>
              <div className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  PERSISTENCE
                </p>
                <p className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  ACID REPLSET
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Transactional Write Lock</p>
              </div>
            </div>
          </div>

          {/* Interactive Live Sandbox Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-lg bg-[#0B0F17] text-slate-100 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[#070A10] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>consentlog://ledger-inspector</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  CHAIN_VERIFIED
                </span>
              </div>

              {/* Interactive Mini Toggle Matrix */}
              <div className="p-4 border-b border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <span>INTERACTIVE PREFERENCE MATRIX</span>
                  <span>NOTICE v2.0</span>
                </div>
                {[
                  { key: 'essential', label: 'Essential Session Security', locked: true },
                  { key: 'analytics', label: 'Anonymized Telemetry', locked: false },
                  { key: 'marketing', label: 'Campaign Attribution', locked: false },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-3 py-2 rounded bg-slate-900/90 border border-slate-800/90 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{item.label}</span>
                      {item.locked && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          LOCKED
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        !item.locked &&
                        setPreviewPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))
                      }
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                        previewPrefs[item.key]
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {previewPrefs[item.key] ? 'GRANTED' : 'WITHDRAWN'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Live Chained Block Stream */}
              <div className="p-4 space-y-2.5 font-mono text-[11px]">
                <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-indigo-400 font-semibold">BLK #000013 • AUD-000013</span>
                    <span>UTC {new Date().toISOString().slice(11, 19)}</span>
                  </div>
                  <p className="text-slate-200">
                    Marketing Cookies: ENABLED →{' '}
                    <span className="text-rose-400 font-semibold">DISABLED (WITHDRAWN)</span>
                  </p>
                  <div className="text-[10px] text-slate-500 truncate pt-1">
                    prev: 7c4e91f8b02d4e8a... • curr: e3b0c44298fc1c14...
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-indigo-400 font-semibold">BLK #000012 • AUD-000012</span>
                    <span>NOTICE v2.0</span>
                  </div>
                  <p className="text-slate-200">
                    Policy Acknowledgment: PENDING →{' '}
                    <span className="text-emerald-400 font-semibold">ACCEPTED (v2.0)</span>
                  </p>
                  <div className="text-[10px] text-slate-500 truncate pt-1">
                    prev: 19a8f021c9d130b2... • curr: 7c4e91f8b02d4e8a...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Specification Matrix */}
      <section className="py-14 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">
            SYSTEM ARCHITECTURE
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Engineered for Regulatory Auditability & Zero-Trust Verification
          </h2>
        </div>

        <div className="grid md:grid-cols-3 border border-slate-200/90 dark:border-slate-800/90 rounded-lg bg-white dark:bg-[#0D1322] divide-y md:divide-y-0 md:divide-x divide-slate-200/90 dark:divide-slate-800/90">
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                01 // PREFERENCE ENGINE
              </span>
              <Sliders className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Granular Consent & Statutory Withdrawal
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforces strict privacy-by-default across 5 processing categories. Protects mandatory
              Essential Cookies at the schema and API layers while supporting single-click GDPR
              Art. 7(3) Right-to-Withdraw and signed DSAR JSON exports.
            </p>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                02 // CRYPTOGRAPHIC LEDGER
              </span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Append-Only SHA-256 Hash Chaining
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every state transition is committed inside an ACID MongoDB transaction with
              deterministic SHA-256 linking (`previousHash` → `eventHash`). Includes an interactive
              Tamper Attack Simulator proving cascade hash invalidation.
            </p>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                03 // POLICY LINEAGE
              </span>
              <GitCompare className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Clause-Level Diffs & Renewal Tracking
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Compare Privacy Notice v1.0, v1.1, and v2.0 side-by-side with added, modified, and
              removed clause highlighting. Publishing a new version triggers explicit renewal
              banners without assuming automatic subject consent.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/90 dark:border-slate-800/90 py-5 px-4 sm:px-8 bg-white dark:bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              CONSENTLOG ENTERPRISE v2.0
            </span>
          </div>
          <div>REACT 18 • EXPRESS • MONGODB REPLICA SET • SHA-256</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
