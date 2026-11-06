import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const DEMO_PERSONAS = [
  { role: 'Admin', name: 'Elena Vance', title: 'Chief Privacy Officer', email: 'admin@consentlog.io' },
  { role: 'Auditor', name: 'Marcus Sterling', title: 'Compliance Auditor', email: 'marcus@pacifichealth.us' },
  { role: 'DPO', name: 'Priya Nair', title: 'Data Protection Officer', email: 'priya@cloudscale.in' },
  { role: 'User', name: 'Alex Rivera', title: 'Data Subject', email: 'alex@enterprise.io' },
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
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-8 bg-[var(--bg-app,#080C14)] text-[var(--text-main,#F8FAFC)] selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Top Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center transition-transform group-hover:scale-105">
            <ShieldCheck className="size-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
            ConsentLog
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="size-8 inline-flex items-center justify-center rounded-lg border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
        </button>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-[400px] mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in to your account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Enter your credentials or choose a demo persona below.
          </p>
        </div>

        <div className="luxury-card p-6 sm:p-7 space-y-5">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="name@company.com"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Password123!</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-xs transition-opacity hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {submitting ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-slate-200 dark:border-white/10 w-full" />
            <span className="bg-[var(--bg-card,#FFFFFF)] px-2.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 absolute">
              or quick demo
            </span>
          </div>

          {/* Clean Segmented Demo Personas */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {DEMO_PERSONAS.map((p) => {
              const active = email === p.email;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  className={`h-9 px-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-xs font-semibold'
                      : 'border-slate-200/90 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded ml-1 shrink-0 ${
                      active
                        ? 'bg-white/20 dark:bg-black/10 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {p.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an enterprise account?{' '}
          <Link
            to="/register"
            className="font-medium text-slate-900 dark:text-white underline underline-offset-4 hover:opacity-80"
          >
            Create one
          </Link>
        </p>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-600 font-mono">
        <span>ConsentLog Enterprise</span>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Home</Link>
          <a href="#privacy" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Privacy</a>
          <a href="#terms" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
