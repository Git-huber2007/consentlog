import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  KeyRound,
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
  },
  {
    role: 'Auditor',
    name: 'Marcus Sterling',
    title: 'Compliance Auditor',
    email: 'marcus@pacifichealth.us',
    initials: 'MS',
  },
  {
    role: 'DPO',
    name: 'Priya Nair',
    title: 'Data Protection Officer',
    email: 'priya@cloudscale.in',
    initials: 'PN',
  },
  {
    role: 'User',
    name: 'Alex Rivera',
    title: 'General Data Subject',
    email: 'alex@enterprise.io',
    initials: 'AR',
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
    <div className="min-h-screen grid lg:grid-cols-12 bg-white dark:bg-[#07090E] text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      {/* ===================================================================
          LEFT COLUMN: QUIET LUXURY PRODUCT PREVIEW (lg:col-span-7)
          Monochromatic, architectural, zero rainbow AI slop
          =================================================================== */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-10 xl:p-14 bg-[#0B0E17] text-white border-r border-white/5 overflow-hidden">
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white">
                ConsentLog
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">
                Cryptographic Consent Governance
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/10 text-slate-300">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>SHA-256 Ledger Online</span>
          </span>
        </div>

        {/* Center: Monochromatic macOS Product Interface Preview */}
        <div className="relative z-10 my-auto py-8">
          <div className="mb-6 space-y-2 max-w-lg">
            <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Enterprise consent verification, sealed block by block.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Continuous SHA-256 audit logs with tamper-evident chain validation and strict policy enforcement.
            </p>
          </div>

          {/* Minimalist macOS Window Frame */}
          <div className="rounded-xl border border-white/10 bg-[#0F1422]/90 shadow-2xl backdrop-blur-md overflow-hidden">
            {/* Titlebar */}
            <div className="h-9 px-4 bg-[#0A0D16] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-white/20" />
                <span className="size-2 rounded-full bg-white/20" />
                <span className="size-2 rounded-full bg-white/20" />
              </div>
              <div className="h-5 px-3 rounded-full bg-white/[0.03] border border-white/5 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="text-slate-500 font-bold">https://</span>
                <span className="text-slate-300">consentlog.io/ledger/live</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">v2.0 Active</div>
            </div>

            {/* Window Interior: Real Live Mini-Dashboard */}
            <div className="p-5 space-y-4 text-xs font-sans">
              {/* 3 Bento Metric Tiles (Clean Neutral) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Ledger Blocks</span>
                  <p className="font-mono text-lg font-bold text-white mt-0.5">13 Blocks</p>
                  <span className="text-[10px] text-slate-400 font-medium">100% Intact</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Active Policy</span>
                  <p className="font-mono text-lg font-bold text-white mt-0.5">v2.0 Policy</p>
                  <span className="text-[10px] text-slate-400 font-medium">5 Categories</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Chain Latency</span>
                  <p className="font-mono text-lg font-bold text-white mt-0.5">&lt; 14ms</p>
                  <span className="text-[10px] text-slate-400 font-medium">Verified SLA</span>
                </div>
              </div>

              {/* Live Audit Ledger Stream */}
              <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden divide-y divide-white/5 text-[11px]">
                <div className="p-2.5 flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider bg-white/[0.01]">
                  <span>Live Audit Stream</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">#13</span>
                    <span className="text-slate-200">Elena Vance</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-300">Notice v2.0 Accepted</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    SEALED
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">#12</span>
                    <span className="text-slate-200">Alex Rivera</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-300">Marketing Cookies Withdrawn</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    OPT-OUT
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">#11</span>
                    <span className="text-slate-200">Marcus Sterling</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-300">Chain Audit Verification Completed</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    VALIDATED
                  </span>
                </div>
              </div>

              {/* Head Hash Footer */}
              <div className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Head Hash: c72a42c0347674db192411bde1fd85edde...</span>
                <span className="text-slate-300 font-medium">Chain Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attestation Strip */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5 font-mono">
          <span>GDPR Art. 7(1) · India DPDP Act 2023 · CCPA/CPRA</span>
          <span>ConsentLog Enterprise v2.0</span>
        </div>
      </div>

      {/* ===================================================================
          RIGHT COLUMN: AUTHENTICATION PORTAL (lg:col-span-5)
          Minimalist, Linear/Vercel Monochromatic Design
          =================================================================== */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 xl:p-12 relative z-10 bg-slate-50/50 dark:bg-[#07090E]">
        {/* Top bar with Theme Switcher */}
        <div className="flex items-center justify-between">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="size-4.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              ConsentLog
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="size-8.5 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="size-4 text-slate-300" /> : <Moon className="size-4 text-slate-600" />}
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
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select an enterprise role below or enter your credentials.
            </p>
          </div>

          {/* Quick Demo Persona Matrix (Neutral, Monochromatic) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-slate-500 dark:text-slate-400" />
                <span>Instant Demo Access</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1-Click Auto Fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_PERSONAS.map((p) => {
                const active = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 cursor-pointer relative ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`size-6.5 rounded-md flex items-center justify-center font-mono text-[9px] font-bold border shrink-0 ${
                        active
                          ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950 border-white/20 dark:border-slate-950/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold truncate ${active ? 'text-white dark:text-slate-950' : 'text-slate-900 dark:text-white'}`}>
                          {p.name.split(' ')[0]}
                        </p>
                      </div>
                      <p className={`text-[10px] truncate ${active ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-colors"
                />
              </div>
            </div>

            {/* Quiet Luxury Action Button (Vercel / Linear Monochromatic High-Contrast) */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>New organization?</span>
            <Link
              to="/register"
              className="font-semibold text-slate-900 dark:text-white hover:underline"
            >
              Create Account →
            </Link>
          </div>
        </div>

        {/* Small Bottom Copyright */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          Protected by SHA-256 Ledger &amp; JWT Security Architecture
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
