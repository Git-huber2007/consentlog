import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  Check,
  Shield,
  KeyRound,
  Sparkles,
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
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    avatarClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    role: 'Auditor',
    name: 'Marcus Sterling',
    title: 'Compliance Auditor',
    email: 'marcus@pacifichealth.us',
    initials: 'MS',
    color: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    avatarClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  {
    role: 'DPO',
    name: 'Priya Nair',
    title: 'Data Protection Officer',
    email: 'priya@cloudscale.in',
    initials: 'PN',
    color: 'sky',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
    avatarClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  {
    role: 'User',
    name: 'Alex Rivera',
    title: 'General Data Subject',
    email: 'alex@enterprise.io',
    initials: 'AR',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
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
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden bg-[var(--bg-app,#080C14)] text-[var(--text-main,#F8FAFC)] selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Decorative ambient lighting spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
            <ShieldCheck className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
              ConsentLog
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-bold -mt-0.5">
              Enterprise Trust
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
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
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-[440px] mx-auto my-auto py-6 relative z-10">
        {/* Card Header Stamp */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-3 shadow-xs">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cryptographic Ledger Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to ConsentLog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
            Sign in with your enterprise credentials or click a pre-configured role to explore.
          </p>
        </div>

        {/* Elevated Luxury Card */}
        <div className="luxury-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle top specular accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />

          {/* Quick Demo Persona Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-emerald-500" />
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
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer relative overflow-hidden group ${
                      active
                        ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border shrink-0 ${p.avatarClass}`}
                    >
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </p>
                        {active && (
                          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {p.role} · {p.title.split(' ')[0]}
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

          {/* Cryptographic Trust Stamp */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Shield className="size-3 text-emerald-500" />
              <span>SHA-256 Verified Ledger</span>
            </span>
            <span>GDPR Art. 7 Proof</span>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          New enterprise organization?{' '}
          <Link
            to="/register"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Create Workspace →
          </Link>
        </p>
      </main>

      {/* Bottom Legal Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-600 font-mono relative z-10 pt-4">
        <span>ConsentLog Enterprise v2.0</span>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Documentation</Link>
          <a href="#security" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Security Whitepaper</a>
          <a href="#compliance" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Compliance SLAs</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
