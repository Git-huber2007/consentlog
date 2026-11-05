import React, { useState } from 'react';
import { Save, ShieldCheck, Download } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfileSettingsPage = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    organization: user?.organization || 'Acme Corp',
    department: user?.department || 'Operations',
    jurisdiction: user?.jurisdiction || 'GDPR (EU)',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', formData);
      setUser(res.data.user);
      localStorage.setItem('consentlog_user', JSON.stringify(res.data.user));
      addToast(res.data.message, 'success', 'Profile Saved');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Account Settings
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Update your profile details and applicable privacy region.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="enterprise-card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2 rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-sm font-mono cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Organization
            </label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Region
            </label>
            <select
              value={formData.jurisdiction}
              onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            >
              <option value="GDPR (EU)">GDPR (EU)</option>
              <option value="CCPA (California)">CCPA (California)</option>
              <option value="DPDP (India)">DPDP (India)</option>
              <option value="LGPD (Brazil)">LGPD (Brazil)</option>
              <option value="Global Standard">Global Standard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Role
            </label>
            <input
              type="text"
              disabled
              value={(user?.role || 'user').toUpperCase()}
              className="w-full px-3.5 py-2 rounded-md border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-sm font-mono font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 flex items-center gap-2 transition-opacity"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Compliance & Data Portability Passport */}
      <div className="enterprise-card p-6 mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Data Subject Access Request (DSAR) Passport
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              Generate and download your cryptographically signed compliance bundle conforming to GDPR Art. 15 (Right of Access), GDPR Art. 20 (Data Portability), and India DPDP Act Sec. 11. Includes complete tamper-evident audit lineage signed with SHA-256.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                addToast('Generating signed DSAR Compliance Passport...', 'info');
                const res = await api.get('/audit/dsar-passport');
                const jsonContent = JSON.stringify(res.data, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `consentlog-dsar-passport-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                addToast(
                  `DSAR Passport downloaded! SHA-256: ${res.data.passportSignature?.slice(0, 12)}...`,
                  'success'
                );
              } catch (err) {
                addToast(err.response?.data?.message || 'Could not download DSAR passport.', 'error');
              }
            }}
            className="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <Download className="size-3.5" />
            <span>Download DSAR Passport</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
