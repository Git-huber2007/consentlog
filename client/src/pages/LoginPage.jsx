import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('alex@enterprise.io');
  const [password, setPassword] = useState('Password123!');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(email, password);
      addToast(
        `Welcome back, ${data.user.name}! Signed in as ${data.user.role.toUpperCase()}.`,
        'success',
        'Authentication Verified'
      );
      navigate('/dashboard');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Invalid credentials. Please check your email and password.',
        'error',
        'Authentication Failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const quickFill = (demoEmail, roleLabel) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    addToast(`Loaded ${roleLabel} credentials (${demoEmail}). Click Sign In to continue.`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
              ConsentLog
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Enterprise Privacy & Preference Portal
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Or{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            register a new privacy-by-default account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 sm:px-10 space-y-6">
          {/* One-Click Demo Role Switcher */}
          <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/70 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Enterprise Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill('alex@enterprise.io', 'Enterprise User')}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  email === 'alex@enterprise.io'
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-sm'
                    : 'bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white'
                }`}
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">Alex Rivera</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Standard User (GDPR)</p>
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@consentlog.io', 'Chief Privacy Officer (Admin)')}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  email === 'admin@consentlog.io'
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-sm'
                    : 'bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white'
                }`}
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">Elena Vance</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Admin / CPO Role
                </p>
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Enterprise Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="you@enterprise.io"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to ConsentLog'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Protected by JWT & bcrypt (12 rounds)</span>
            <Link to="/" className="hover:underline font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

