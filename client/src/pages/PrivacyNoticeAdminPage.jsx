import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Plus,
  GitCompare,
  Power,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PrivacyNoticeAdminPage = () => {
  const { refreshSession } = useAuth();
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activatingId, setActivatingId] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Global AI Telemetry & Sub-Processor Governance Notice',
    version: '2.1',
    summaryOfChanges:
      'Introduces explicit safeguards for zero-retention AI compliance assistants and updates cross-border transfer clauses.',
    content: `SECTION 1: SCOPE & GOVERNANCE
ConsentLog Enterprise Edition v2.1 updates our global privacy framework with explicit transparency around zero-retention AI analytics and sub-processor auditability.

SECTION 2: PREFERENCE CATEGORIES
Essential Cookies remain mandatory. Analytics, Marketing, Personalization, and Third-Party Data Sharing remain strictly opt-in.

SECTION 3: RENEWED CONSENT REQUIREMENT
Existing users are notified via the Notice Update Banner and may compare clause differences before recording their acceptance.`,
    requiresRenewedConsent: true,
    isActive: true,
    clauseHeading: '8. Zero-Retention AI Governance Safeguards (New in v2.1)',
    clauseBody:
      'Enterprise telemetry processed through automated compliance diagnostics is strictly isolated with zero model training retention.',
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      setNotices(res.data.notices || []);
    } catch (err) {
      addToast('Failed to load notices.', 'error');
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

      addToast(res.data.message, 'success', 'Notice Version Published');
      await fetchNotices();
      await refreshSession();
      // Increment suggested version for convenience
      setFormData((prev) => ({
        ...prev,
        version: `${(parseFloat(prev.version) + 0.1).toFixed(1)}`,
      }));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to publish notice.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateNotice = async (id, version) => {
    setActivatingId(id);
    try {
      const res = await api.patch(`/admin/notices/${id}/activate`);
      addToast(res.data.message, 'success', `Notice v${version} Activated`);
      await fetchNotices();
      await refreshSession();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to activate notice.', 'error');
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Privacy Notice Administration & Lifecycle Control
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish new versioned privacy notices and control policy activation. Activating a new
            version never assumes automatic user acceptance—users are prompted via the Notice
            Renewal Banner.
          </p>
        </div>

        <Link
          to="/notices/compare"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center"
        >
          <GitCompare className="w-4 h-4 text-indigo-500" />
          <span>Compare Versions</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Publish New Notice Form */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handlePublishNotice}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>Publish New Privacy Notice Version</span>
            </h2>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Version Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 2.1"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Summary of Changes
              </label>
              <input
                type="text"
                required
                value={formData.summaryOfChanges}
                onChange={(e) => setFormData({ ...formData, summaryOfChanges: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  New Clause Heading (For Diff Comparison)
                </label>
                <input
                  type="text"
                  value={formData.clauseHeading}
                  onChange={(e) => setFormData({ ...formData, clauseHeading: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  New Clause Provision Text
                </label>
                <input
                  type="text"
                  value={formData.clauseBody}
                  onChange={(e) => setFormData({ ...formData, clauseBody: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Full Verbatim Notice Content
              </label>
              <textarea
                rows={5}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={formData.requiresRenewedConsent}
                  onChange={(e) =>
                    setFormData({ ...formData, requiresRenewedConsent: e.target.checked })
                  }
                  className="rounded text-indigo-600"
                />
                <span>Require Renewed User Consent</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Set as Active Policy Immediately</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              {submitting
                ? 'Publishing & Logging Audit Event...'
                : `Publish Privacy Notice v${formData.version}`}
            </button>
          </form>
        </div>

        {/* Existing Notice Versions & Activation Control */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Existing Notice Versions & Activation Status
          </h2>

          {notices.map((n) => (
            <div
              key={n._id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm space-y-3 ${
                n.isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                    Version {n.version}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      n.isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {n.isActive ? 'Active Policy' : n.status}
                  </span>
                </div>

                {!n.isActive && (
                  <button
                    onClick={() => handleActivateNotice(n._id, n.version)}
                    disabled={activatingId === n._id}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {activatingId === n._id ? 'Activating...' : `Activate v${n.version}`}
                    </span>
                  </button>
                )}
              </div>

              <p className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{n.summaryOfChanges}</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Effective: {new Date(n.effectiveDate).toLocaleDateString()}</span>
                <span>Clauses: {n.clauses?.length || 0}</span>
                <span>
                  Renewed Consent Required: <strong>{n.requiresRenewedConsent ? 'Yes' : 'No'}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyNoticeAdminPage;

