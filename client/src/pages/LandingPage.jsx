import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Check,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const INITIAL_BLOCKS = [
  {
    seq: '000014',
    id: 'AUD-000014',
    category: 'Campaign Attribution',
    transition: 'ENABLED -> WITHDRAWN',
    status: 'withdrawn',
    prevHash: '7c4e91f8b02d4e8a',
    currHash: 'e3b0c44298fc1c14',
  },
  {
    seq: '000013',
    id: 'AUD-000013',
    category: 'Notice v2.0 Acknowledgment',
    transition: 'PENDING -> ACCEPTED',
    status: 'granted',
    prevHash: '19a8f021c9d130b2',
    currHash: '7c4e91f8b02d4e8a',
  },
];

const LandingPage = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [previewPrefs, setPreviewPrefs] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  });
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);

  const handleTogglePreview = (key, label) => {
    const nextVal = !previewPrefs[key];
    setPreviewPrefs((prev) => ({ ...prev, [key]: nextVal }));

    const nextSeq = String(14 + blocks.length - 1).padStart(6, '0');
    const prevHead = blocks[0]?.currHash || 'e3b0c44298fc1c14';
    const nextHash = Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);

    setBlocks((prev) => [
      {
        seq: nextSeq,
        id: `AUD-${nextSeq}`,
        category: label,
        transition: nextVal ? 'WITHDRAWN -> GRANTED' : 'GRANTED -> WITHDRAWN',
        status: nextVal ? 'granted' : 'withdrawn',
        prevHash: prevHead,
        currHash: nextHash,
      },
      ...prev.slice(0, 2),
    ]);
  };

  return (
    <div className="min-h-dvh bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAFAFA]/85 dark:bg-[#09090B]/85 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <ShieldCheck className="size-3.5 text-white dark:text-zinc-950" />
            </div>
            <span className="font-semibold text-sm tracking-tight">ConsentLog</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="size-9 inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="h-9 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium flex items-center gap-1.5"
              >
                <span>Open Workspace</span>
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="h-9 px-3 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="h-9 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90 text-xs font-medium flex items-center gap-1.5"
                >
                  <span>Start Sandbox</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Split Hero (Max 3 text elements: Headline, Subtext <= 20 words, CTAs) */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-zinc-950 dark:text-white">
              Cryptographic consent &amp; preference infrastructure.
            </h1>

            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              Record, verify, and audit subject privacy choices on an append-only SHA-256 ledger with clause-level policy diffs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="h-10 px-5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs flex items-center gap-2 hover:opacity-90"
              >
                <span>{user ? 'Open Workspace' : 'Explore Live Ledger'}</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to={user ? '/preferences' : '/register'}
                className="h-10 px-5 rounded-md bg-white dark:bg-[#111113] hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-800 flex items-center"
              >
                {user ? 'Manage Preferences' : 'Create Subject Account'}
              </Link>
            </div>
          </div>

          {/* Interactive Live Ledger Component */}
          <div className="lg:col-span-6">
            <div className="rounded-xl bg-white dark:bg-[#111113] border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Interactive Preference Matrix
                </span>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  SHA-256 Linked
                </span>
              </div>

              <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
                {[
                  { key: 'essential', label: 'Session Security Cookies', locked: true },
                  { key: 'analytics', label: 'Product Telemetry', locked: false },
                  { key: 'marketing', label: 'Campaign Attribution', locked: false },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {item.label}
                      </span>
                      {item.locked && (
                        <Lock className="size-3 text-zinc-400" title="Required by statute" />
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={item.locked}
                      onClick={() => !item.locked && handleTogglePreview(item.key, item.label)}
                      className={`font-mono text-[11px] px-2.5 py-1 rounded-md font-medium ${
                        previewPrefs[item.key]
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-700'
                      } ${item.locked ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                      {previewPrefs[item.key] ? 'Granted' : 'Withdrawn'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 space-y-2 bg-zinc-50/50 dark:bg-[#0C0C0E] font-mono text-[11px] tabular-nums">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-1">
                  <span>APPEND-ONLY BLOCK STREAM</span>
                  <span>CLICK TOGGLES ABOVE TO APPEND</span>
                </div>
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        #{b.seq} / {b.id}
                      </span>
                      <span
                        className={
                          b.status === 'granted'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {b.transition}
                      </span>
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400">{b.category}</div>
                    <div className="text-[10px] text-zinc-400 truncate pt-0.5">
                      prev:{b.prevHash} / curr:{b.currHash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Bento Architecture (2 + 1 Split, No Eyebrows, No 01/02/03 Numbers) */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-10">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Built for statutory proof, not checkbox theater.
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Every state change is serialized into a verifiable hash chain with zero mutation endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Primary Wide Cell (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-xl bg-zinc-900 dark:bg-[#131316] text-white border border-zinc-800 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Deterministic SHA-256 Hash Chaining
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg">
                Consent mutations commit inside an ACID MongoDB transaction linking each record to its predecessor. Modifying any historical row invalidates every downstream digest in the Tamper Verifier.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/90 font-mono text-xs space-y-1.5 tabular-nums">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span>CANONICAL DIGEST FORMULA</span>
                <span className="text-emerald-400">0 PUT / PATCH / DELETE ROUTES</span>
              </div>
              <p className="text-zinc-200 truncate">
                SHA256(seq || userId || category || prevVal || newVal || timestamp || prevHash)
              </p>
            </div>
          </div>

          {/* Secondary Tall Cell (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Clause-Level Policy Diffs
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Compare Privacy Notice versions side-by-side before acknowledging updates. Publishing a new release prompts explicit subject renewal without silent opt-in carryover.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="px-3 py-2 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                + Clause 4.2: Signed DSAR JSON Portability
              </div>
              <div className="px-3 py-2 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 line-through opacity-75">
                - Clause 3.1: 90-Day Telemetry Retention
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Cell (12 cols) */}
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-xl bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                GDPR Art. 7(3) Withdrawal &amp; Art. 20 Portability Passports
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Subjects can revoke all optional processing in a single click or export a cryptographically signed JSON passport containing their complete historical audit chain.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              {['GDPR (EU)', 'CCPA / CPRA', 'India DPDP 2023', 'ISO 27701'].map((fw) => (
                <span
                  key={fw}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <Check className="size-3.5 text-emerald-500" />
                  <span>{fw}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 dark:border-zinc-800/80 py-6 px-4 sm:px-8 bg-white dark:bg-[#0C0C0E]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-zinc-900 dark:text-zinc-100" />
            <span className="font-medium text-zinc-900 dark:text-zinc-100">ConsentLog</span>
          </div>
          <div>Cryptographic Consent &amp; Preference Governance</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
