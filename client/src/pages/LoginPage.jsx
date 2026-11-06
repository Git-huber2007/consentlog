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
  Layers,
  FileCheck2,
  Sparkles,
  Users,
  Building2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const DEMO_PROFILES = [
  {
    role: 'Admin',
    name: 'Elena Vance',
    title: 'Chief Privacy Officer',
    email: 'admin@consentlog.io',
    org: 'ConsentLog HQ',
    badge: 'from-emerald-500 to-teal-500',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    role: 'Auditor',
    name: 'Marcus Sterling',
    title: 'Compliance Auditor',
    email: 'marcus@pacifichealth.us',
    org: 'Pacific Health',
    badge: 'from-purple-500 to-indigo-500',
    chip: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  {
    role: 'DPO',
    name: 'Priya Nair',
    title: 'Data Protection Officer',
    email: 'priya@cloudscale.in',
    org: 'CloudScale Networks',
    badge: 'from-sky-500 to-blue-500',
    chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  {
    role: 'User',
    name: 'Alex Rivera',
    title: 'Data Subject',
    email: 'alex@enterprise.io',
    org: 'Enterprise Global',
    badge: 'from-amber-500 to-orange-500',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
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

  const handleQuickSelect = (profile) => {
    setEmail(profile.email);
    setPassword('Password123!');
    addToast(`Selected ${profile.name} (${profile.role}).`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-app,#080C14)] text-[var(--text-main,#F8FAFC)] transition-colors duration-200">
      {/* ===================================================================
          LEFT BRAND & TRUST SHOWCASE (Desktop lg: 50% width)
          =================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-slate-200/80 dark:border-white/10 bg-slate-900 dark:bg-[#070A12] text-white">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-105">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white">
                ConsentLog
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-400 font-bold -mt-0.5">
                Enterprise Trust Platform
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/5 border border-white/10 text-emerald-400 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SHA-256 Merkle Ledger</span>
          </span>
        </div>

        {/* Centerpiece Showcase */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="size-3" />
              <span>Cryptographic Proof Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              The immutable record of privacy rights &amp; verifiable consent.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every opt-in, policy revision, and right-to-erasure event is mathematically anchored into a tamper-evident append-only hash chain.
            </p>
          </div>

          {/* Holographic Ledger Mockup Card */}
          <div className="rounded-2xl p-5 border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  Audit Chain Seal #13
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                ZERO BREAKS
              </span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Merkle Head Hash:</span>
                <span className="text-emerald-300 font-semibold truncate max-w-[210px]">
                  c72a42c0347674db192411bde1fd85ed...
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Proof Standard:</span>
                <span className="text-slate-200">GDPR Art. 7(1) Demonstrable Proof</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>SLA Retention:</span>
                <span className="text-slate-200">365-Day Automatic Rotation</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Genesis</span>
                <span className="font-mono text-xs font-bold text-white">Block #1</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Verified</span>
                <span className="font-mono text-xs font-bold text-emerald-400">100% Intact</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Latency</span>
                <span className="font-mono text-xs font-bold text-white">&lt; 14ms</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>India DPDP Act 2023</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>EU GDPR Art. 17 Erasure</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span>CCPA/CPRA Compliant</span>
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between pt-4 border-t border-white/10 font-mono">
          <span>Enterprise Version 2.0</span>
          <span>© 2026 ConsentLog Security</span>
        </div>
      </div>

      {/* ===================================================================
          RIGHT AUTH PORTAL (Mobile: full-width, Desktop: 50% width)
          =================================================================== */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top bar with Theme Toggle & Return link */}
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
              className="size-8 inline-flex items-center justify-center rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
            </button>
            <Link
              to="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Back to Home →
            </Link>
          </div>
        </div>

        {/* Center Sign In Box */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sign in to Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Enter your credentials or choose a pre-configured demo persona.
            </p>
          </div>

          {/* Quick Persona Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-emerald-500" />
                <span>One-Click Demo Roles</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Auto-populates inputs</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_PROFILES.map((p) => {
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickSelect(p)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'luxury-card border-emerald-500/60 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.badge}`} />
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${p.chip}`}>
                        {p.role}
                      </span>
                      {isSelected && (
                        <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {p.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-2xs backdrop-blur-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-2xs backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-luxury w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>New tenant workspace?</span>
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
