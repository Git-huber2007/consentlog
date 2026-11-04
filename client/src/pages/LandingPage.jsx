import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Sliders,
  FileText,
  GitCompare,
  ArrowRight,
  CheckCircle2,
  Database,
  Activity,
  Terminal,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">ConsentLog</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Enterprise v2.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                <span>Open Enterprise Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GDPR • CCPA/CPRA • India DPDP Act 2023 • ISO/IEC 27701</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Cryptographic Consent &{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                Preference Governance
              </span>{' '}
              for Modern Enterprises.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Collect, customize, withdraw, and audit user consent through a centralized preference
              engine backed by a tamper-evident, SHA-256 hash-chained MongoDB audit ledger and
              version-controlled privacy notices.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all"
              >
                <span>{user ? 'Go to Dashboard' : 'Launch Interactive Demo'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={user ? '/preferences' : '/register'}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
              >
                {user ? 'Open Preference Centre' : 'Create Enterprise Account'}
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">SHA-256</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Canonical Hash-Chained Audit Ledger
                </p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Append-Only Immutability Enforcement
                </p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">ACID</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Transactional Preference & Audit Sync
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-navy-900 text-slate-100 p-6 shadow-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    APPEND-ONLY AUDIT STREAM (LIVE SHA-256)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  CHAIN VERIFIED
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-indigo-400 font-semibold">#000013 • AUD-000013-9F2A</span>
                    <span>Notice v2.0</span>
                  </div>
                  <p className="text-white font-sans font-semibold text-sm">
                    Marketing Cookies: Enabled → Disabled
                  </p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Consent Withdrawn
                    </span>
                    <span className="text-slate-400">Source: User</span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-400 truncate">
                    prevHash: 7c4e91f8b02d4e8a... • eventHash: e3b0c44298fc1c14...
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-indigo-400 font-semibold">#000012 • AUD-000012-4B1C</span>
                    <span>Notice v2.0</span>
                  </div>
                  <p className="text-white font-sans font-semibold text-sm">
                    Privacy Notice v2.0: Pending → Accepted
                  </p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Notice Accepted
                    </span>
                    <span className="text-slate-400">Source: User</span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-400 truncate">
                    prevHash: 19a8f021c9d130b2... • eventHash: 7c4e91f8b02d4e8a...
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs text-indigo-200">
                    PUT / PATCH / DELETE blocked at API & ODM layers
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Three Enterprise Capabilities Built into One Unified Platform
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Designed after industry leaders like OneTrust and Metaplane with genuine database
            persistence and cryptographic auditability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Interactive Preference Centre
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Granular toggles for Essential, Analytics, Marketing, Personalization, and
              Third-Party Data Sharing. Protects mandatory Essential Cookies while allowing instant
              Accept All, Reject Optional, or formal GDPR Right-to-Withdraw.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Immutable SHA-256 Audit History
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every preference change writes an append-only `ConsentLog` document inside a MongoDB
              transaction. Each event stores `previousHash` and `eventHash` computed via canonical
              SHA-256 serialization with live integrity verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Versioned Privacy Notices & Diffs
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Compare Privacy Notice v1.0, v1.1, and v2.0 side-by-side with highlighted added,
              modified, and removed clauses. Publishing a new version triggers user renewal banners
              without assuming automatic consent.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              ConsentLog Enterprise Edition v2.0
            </span>
            <span>— Intelligent Consent & Preference Management Platform</span>
          </div>
          <div>Built with React, Tailwind CSS, Express, MongoDB & SHA-256 Hash Chaining</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

