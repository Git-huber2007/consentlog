import React, { useState } from 'react';
import { Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfileSettingsPage = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    organization: user?.organization || 'Enterprise Global Corp',
    department: user?.department || 'General Operations',
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
          Profile & Jurisdiction Settings
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Configure your organizational identity and applicable data protection framework.
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
              Registered Email (Immutable)
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
              Primary Regulatory Jurisdiction
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
              RBAC Security Role
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
            <span>{saving ? 'Saving...' : 'Save Profile Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
