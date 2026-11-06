import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Shield,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const DEMO_PERSONAS = [
  {
    role: 'Admin',
    name: 'Elena Vance',
    title: 'Chief Privacy Officer',
    email: 'admin@consentlog.io',
    initials: 'EV',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    avatarClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    role: 'Auditor',
    name: 'Marcus Sterling',
    title: 'Compliance Auditor',
    email: 'marcus@pacifichealth.us',
    initials: 'MS',
    color: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    avatarClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  {
    role: 'DPO',
    name: 'Priya Nair',
    title: 'Data Protection Officer',
    email: 'priya@cloudscale.in',
    initials: 'PN',
    color: 'sky',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    avatarClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  {
    role: 'User',
    name: 'Alex Rivera',
    title: 'General Data Subject',
    email: 'alex@enterprise.io',
    initials: 'AR',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    avatarClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
];

const LoginPage = () => {
  const [email, setEmail] = useState('admin@consentlog.io');
  const [password, setPassword] = useState('Password123!');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(email, password);
      addToast(`Signed in as ${data.user.name}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Invalid email or password.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPersona = (p) => {
    setEmail(p.email);
    setPassword('Password123!');
    addToast(`Selected ${p.name} (${p.role})`, 'info');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[var(--bg-app,#080C14)] text-[var(--text-main,#F8FAFC)] selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* ===================================================================
          LEFT COLUMN: REAL PRODUCT WINDOW PREVIEW (Desktop lg:col-span-7)
          Eliminates empty screen whitespace with genuine product evidence
          =================================================================== */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-10 xl:p-14 bg-slate-950 text-white border-r border-slate-800/80 overflow-hidden">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-8.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-105">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white">
                ConsentLog
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-400 font-bold -mt-0.5">
                Enterprise Cryptographic Vault
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/5 border border-white/10 text-emerald-400 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SHA-256 Ledger Live</span>
          </span>
        </div>

        {/* Center: Real macOS Product Interface Preview */}
        <div className="relative z-10 my-auto py-8">
          <div className="mb-6 space-y-2 max-w-lg">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise consent verification, sealed block by block.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time demonstration of the ConsentLog ledger running in continuous verification mode.
            </p>
          </div>

          {/* Realistic Window Mockup Frame */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* macOS Window Titlebar */}
            <div className="h-9 px-4 bg-slate-900/95 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-5 px-3.5 rounded-full bg-black/40 border border-white/5 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="text-emerald-400">●</span>
                <span>consentlog.io/ledger/live</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">v2.0 Active</div>
            </div>

            {/* Window Interior: Real Live Mini-Dashboard */}
            <div className="p-5 space-y-4 text-xs font-sans">
              {/* 3 Mini Bento Tiles */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Audited Blocks</span>
                  <p className="font-mono text-lg font-bold text-white mt-0.5">13 Blocks</p>
                  <span className="text-[10px] text-emerald-400 font-medium">100% Intact</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Notice</span>
                  <p className="font-mono text-lg font-bold text-emerald-400 mt-0.5">v2.0 Policy</p>
                  <span className="text-[10px] text-slate-400 font-medium">5 Categories</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Verification</span>
                  <p className="font-mono text-lg font-bold text-sky-400 mt-0.5">&lt; 14ms</p>
                  <span className="text-[10px] text-slate-400 font-medium">Automated SLA</span>
                </div>
              </div>

              {/* Mini Live Audit Ledger Stream */}
              <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden divide-y divide-white/5 text-[11px]">
                <div className="p-2.5 flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider bg-white/[0.02]">
                  <span>Real-Time Audit Stream</span>
                  <span className="text-emerald-400">● Live Feed</span>
                </div>
                <div className="p-2.5 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">#13</span>
                    <span className="text-slate-300">Elena Vance</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-200">Notice v2.0 Accepted</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30">
                    SEALED
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">#12</span>
                    <span className="text-slate-300">Alex Rivera</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-200">Marketing Cookies Withdrawn</span>
                  </div>
                  <span className="text-[10px] text-rose-400 font-semibold px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30">
                    OPT-OUT
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">#11</span>
                    <span className="text-slate-300">Marcus Sterling</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-200">Chain Audit Verification Completed</span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-semibold px-1.5 py-0.2 rounded bg-sky-500/15 border border-sky-500/30">
                    VALIDATED
                  </span>
                </div>
              </div>

              {/* Head Hash Footer */}
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Head Hash: c72a42c0347674db192411bde1fd85edde...</span>
                <span className="text-emerald-400 font-bold">Verified Zero Breaks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attestation Strip */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/10 font-mono">
          <span>GDPR Art. 7(1) · India DPDP Act 2023 · CCPA/CPRA</span>
          <span>ConsentLog Enterprise v2.0</span>
        </div>
      </div>

      {/* ===================================================================
          RIGHT COLUMN: AUTHENTICATION PORTAL (lg:col-span-5)
          =================================================================== */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 xl:p-12 relative z-10">
        {/* Top bar with Theme Switcher */}
        <div className="flex items-center justify-between">
          <div className="lg:hidden flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShieldCheck className="size-4.5" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
              ConsentLog
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="size-8.5 inline-flex items-center justify-center rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs backdrop-blur-sm transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
            </button>
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Back to Home →
            </Link>
          </div>
        </div>

        {/* Center Auth Form */}
        <div className="w-full max-w-sm mx-auto my-auto py-6 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select an enterprise role below or enter your credentials.
            </p>
          </div>

          {/* Quick Demo Persona Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-emerald-500" />
                <span>Instant Demo Access</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Click to Auto-Fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_PERSONAS.map((p) => {
                const active = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden group ${
                      active
                        ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`size-6.5 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold border shrink-0 ${p.avatarClass}`}
                    >
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {p.name.split(' ')[0]}
                        </p>
                        {active && (
                          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {p.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="size-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs backdrop-blur-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Password123!</span>
              </div>
              <div className="relative">
                <Lock className="size-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs backdrop-blur-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-luxury w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>New organization?</span>
            <Link
              to="/register"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Create Account →
            </Link>
          </div>
        </div>

        {/* Small Bottom Copyright */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-600 font-mono">
          Protected by SHA-256 Ledger &amp; JWT Security Architecture
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
