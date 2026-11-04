import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Building2, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: 'FinTech Horizon Ltd',
    department: 'Product & Compliance',
    jurisdiction: 'GDPR (EU)',
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await register(formData);
      addToast(
        `Account created for ${data.user.name}. Privacy-by-default settings logged in SHA-256 ledger.`,
        'success',
        'Onboarding Complete'
      );
      navigate('/preferences');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Registration failed. Check your inputs.',
        'error',
        'Registration Error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white dark:text-zinc-950" />
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
            ConsentLog
          </span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Create your enterprise account
        </h1>
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:opacity-80"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="enterprise-card p-6 sm:p-8 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none"
                  placeholder="Jordan Taylor"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none"
                  placeholder="jordan@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Regulatory Jurisdiction
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none"
                  >
                    <option value="GDPR (EU)">GDPR (EU)</option>
                    <option value="CCPA (California)">CCPA (California)</option>
                    <option value="DPDP (India)">DPDP (India)</option>
                    <option value="LGPD (Brazil)">LGPD (Brazil)</option>
                    <option value="Global Standard">Global Standard</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <strong className="text-zinc-900 dark:text-zinc-100">Privacy-by-Default:</strong>{' '}
                Your account initializes with only Essential Cookies enabled. Optional categories
                remain disabled until you explicitly grant consent.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Account...' : 'Register & Configure Preferences'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
