import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
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

  const quickFill = (demoEmail, roleLabel) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    addToast(`Selected ${roleLabel} (${demoEmail}).`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white dark:text-zinc-950" />
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
            ConsentLog
          </span>
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign in
        </h1>
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:opacity-80"
          >
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="enterprise-card p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Demo Accounts
              </span>
              <span className="text-[11px]">Click to fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickFill('alex@enterprise.io', 'Alex Rivera (Data Subject)')}
                className={`p-2.5 rounded-md text-left border transition-colors ${
                  email === 'alex@enterprise.io'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-semibold">Alex Rivera</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    email === 'alex@enterprise.io'
                      ? 'text-zinc-300 dark:text-zinc-600'
                      : 'text-zinc-500'
                  }`}
                >
                  Data Subject (GDPR)
                </p>
              </button>

              <button
                type="button"
                onClick={() => quickFill('admin@consentlog.io', 'Elena Vance (Admin)')}
                className={`p-2.5 rounded-md text-left border transition-colors ${
                  email === 'admin@consentlog.io'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-semibold">Elena Vance</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    email === 'admin@consentlog.io'
                      ? 'text-zinc-300 dark:text-zinc-600'
                      : 'text-zinc-500'
                  }`}
                >
                  Chief Privacy Officer (Admin)
                </p>
              </button>

              <button
                type="button"
                onClick={() => quickFill('priya@cloudscale.in', 'Priya Nair (DPO)')}
                className={`p-2.5 rounded-md text-left border transition-colors ${
                  email === 'priya@cloudscale.in'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-semibold">Priya Nair</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    email === 'priya@cloudscale.in'
                      ? 'text-zinc-300 dark:text-zinc-600'
                      : 'text-zinc-500'
                  }`}
                >
                  Data Protection Officer (DPO)
                </p>
              </button>

              <button
                type="button"
                onClick={() => quickFill('marcus@pacifichealth.us', 'Marcus Sterling (Auditor)')}
                className={`p-2.5 rounded-md text-left border transition-colors ${
                  email === 'marcus@pacifichealth.us'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-semibold">Marcus Sterling</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    email === 'marcus@pacifichealth.us'
                      ? 'text-zinc-300 dark:text-zinc-600'
                      : 'text-zinc-500'
                  }`}
                >
                  Compliance Auditor
                </p>
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-end text-xs text-zinc-500">
            <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
