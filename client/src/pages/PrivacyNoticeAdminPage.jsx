import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  GitCompare,
  Power,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PrivacyNoticeAdminPage = () => {
  const { refreshSession } = useAuth();
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activatingId, setActivatingId] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Privacy & Cookie Notice Update',
    version: '2.1',
    summaryOfChanges:
      'Updated data retention periods and clarified third-party service provider terms.',
    content: `SECTION 1: OVERVIEW
This notice explains how ConsentLog collects and uses session and preference data.

SECTION 2: PREFERENCE CATEGORIES
Essential Cookies are required for authentication and security. Analytics, Marketing, Personalization, and Third-Party Sharing are optional and off by default.

SECTION 3: POLICY UPDATES
When a new version of this notice is published, existing users are asked to review the changes before accepting.`,
    requiresRenewedConsent: true,
    isActive: true,
    clauseHeading: '8. Sub-Processor Retention Limits (New in v2.1)',
    clauseBody:
      'Third-party service providers may retain logs for no longer than 30 days for security diagnostics.',
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      setNotices(res.data.notices || []);
    } catch (err) {
      addToast('Could not load privacy notices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const baseV2 = notices.find((n) => n.version === '2.0') || notices[0];
      const baseClauses = baseV2?.clauses ? [...baseV2.clauses] : [];
      const newClauses = [
        ...baseClauses,
        {
          clauseId: `CL-0${baseClauses.length + 2}`,
          heading: formData.clauseHeading,
          body: formData.clauseBody,
          category: 'Security',
        },
      ];

      const res = await api.post('/admin/notices', {
        title: formData.title,
        version: formData.version,
        summaryOfChanges: formData.summaryOfChanges,
        content: formData.content,
        requiresRenewedConsent: formData.requiresRenewedConsent,
        isActive: formData.isActive,
        highlights: [formData.summaryOfChanges, formData.clauseHeading],
        clauses: newClauses,
      });

      addToast(res.data.message, 'success', 'Notice Published');
      await fetchNotices();
      await refreshSession();
      setFormData((prev) => ({
        ...prev,
        version: `${(parseFloat(prev.version) + 0.1).toFixed(1)}`,
      }));
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not publish notice.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateNotice = async (id, version) => {
    setActivatingId(id);
    try {
      const res = await api.patch(`/admin/notices/${id}/activate`);
      addToast(res.data.message, 'success', `v${version} Activated`);
      await fetchNotices();
      await refreshSession();
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not activate notice.', 'error');
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Manage Notices
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Publish new privacy notice versions and choose which version is active.
          </p>
        </div>

        <Link
          to="/notices/compare"
          className="px-3.5 py-2 rounded-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare Versions</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <form onSubmit={handlePublishNotice} className="enterprise-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Publish New Version</span>
            </h2>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="2.1"
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Summary of Changes
              </label>
              <input
                type="text"
                required
                value={formData.summaryOfChanges}
                onChange={(e) => setFormData({ ...formData, summaryOfChanges: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Added Clause Heading
                </label>
                <input
                  type="text"
                  value={formData.clauseHeading}
                  onChange={(e) => setFormData({ ...formData, clauseHeading: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Added Clause Text
                </label>
                <input
                  type="text"
                  value={formData.clauseBody}
                  onChange={(e) => setFormData({ ...formData, clauseBody: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Notice Text
              </label>
              <textarea
                rows={5}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.requiresRenewedConsent}
                  onChange={(e) =>
                    setFormData({ ...formData, requiresRenewedConsent: e.target.checked })
                  }
                  className="rounded border-zinc-300"
                />
                <span>Ask users to review and accept</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-zinc-300"
                />
                <span>Set as active version</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Publishing...' : `Publish v${formData.version}`}
            </button>
          </form>
        </div>

        <div className="lg:col-span-6 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Published Versions
          </h2>

          {notices.map((n) => (
            <div
              key={n._id}
              className={`enterprise-card p-5 space-y-3 ${
                n.isActive ? 'border-zinc-900 dark:border-zinc-100' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    v{n.version}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      n.isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {n.isActive ? 'Active' : n.status}
                  </span>
                </div>

                {!n.isActive && (
                  <button
                    onClick={() => handleActivateNotice(n._id, n.version)}
                    disabled={activatingId === n._id}
                    className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"
                  >
                    <Power className="w-3 h-3" />
                    <span>
                      {activatingId === n._id ? 'Setting Active...' : `Make Active`}
                    </span>
                  </button>
                )}
              </div>

              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{n.summaryOfChanges}</p>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Effective {new Date(n.effectiveDate).toLocaleDateString()}</span>
                <span>{n.clauses?.length || 0} clauses</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyNoticeAdminPage;
