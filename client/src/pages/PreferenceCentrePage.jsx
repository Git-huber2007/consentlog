import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Save,
  RotateCcw,
  History,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

const PreferenceCentrePage = () => {
  const { addToast } = useToast();
  const { refreshSession, activeNoticeInfo } = useAuth();

  const [serverPrefs, setServerPrefs] = useState(null);
  const [draftPrefs, setDraftPrefs] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false,
    thirdPartySharing: false,
  });
  const [summary, setSummary] = useState(null);
  const [changeReason, setChangeReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Confirmation modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    variant: 'primary',
    confirmText: 'Confirm',
    details: [],
    actionHandler: null,
  });

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const res = await api.get('/preferences');
      const pref = res.data.preferences;
      setServerPrefs(pref);
      setDraftPrefs({
        essential: true,
        analytics: Boolean(pref.analytics),
        marketing: Boolean(pref.marketing),
        personalization: Boolean(pref.personalization),
        thirdPartySharing: Boolean(pref.thirdPartySharing),
      });
      setSummary(res.data.summary);
    } catch (err) {
      addToast('Failed to load your preference categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  // Compute live summary based on current draft toggles so the user sees immediate feedback
  const computeLiveCounts = () => {
    const optionalKeys = ['analytics', 'marketing', 'personalization', 'thirdPartySharing'];
    let enabled = 1; // essential is always enabled
    let disabled = 0;
    let withdrawn = 0;

    optionalKeys.forEach((key) => {
      if (draftPrefs[key]) {
        enabled += 1;
      } else {
        disabled += 1;
        const wasServerEnabled = serverPrefs?.[key];
        const serverStatus = serverPrefs?.categoryMeta?.[key]?.status;
        if (wasServerEnabled || serverStatus === 'Withdrawn') {
          withdrawn += 1;
        }
      }
    });

    return {
      total: 5,
      enabled,
      disabled,
      withdrawn,
    };
  };

  const liveCounts = computeLiveCounts();

  const hasUnsavedChanges =
    serverPrefs &&
    ['analytics', 'marketing', 'personalization', 'thirdPartySharing'].some(
      (k) => Boolean(draftPrefs[k]) !== Boolean(serverPrefs[k])
    );

  const handleToggleCategory = (key) => {
    if (key === 'essential') {
      addToast(
        'Essential Cookies are strictly required for platform security and authentication and cannot be disabled.',
        'warning',
        'Protected Category'
      );
      return;
    }
    setDraftPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Save Customized Preferences
  const triggerSaveCustomPreferences = () => {
    if (!hasUnsavedChanges) {
      addToast('No preference modifications to save.', 'info');
      return;
    }

    const modifiedList = ['analytics', 'marketing', 'personalization', 'thirdPartySharing']
      .filter((k) => Boolean(draftPrefs[k]) !== Boolean(serverPrefs[k]))
      .map((k) => ({
        label: summary?.categories?.find((c) => c.key === k)?.name || k,
        value: `${serverPrefs[k] ? 'Enabled' : 'Disabled'} → ${
          draftPrefs[k] ? 'Enabled (Grant)' : 'Disabled (Withdraw)'
        }`,
      }));

    const hasWithdrawal = modifiedList.some((m) => m.value.includes('Withdraw'));

    setModalConfig({
      isOpen: true,
      title: 'Confirm Consent Preference Changes',
      description:
        'Each modified preference category will be committed inside an ACID MongoDB transaction and permanently appended to the SHA-256 hash-chained audit ledger.',
      variant: hasWithdrawal ? 'warning' : 'primary',
      confirmText: 'Save & Sign Audit Record',
      details: [
        ...modifiedList,
        { label: 'Privacy Notice Version', value: `v${activeNoticeInfo?.version || '2.0'}` },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.put('/preferences', {
            ...draftPrefs,
            reason:
              changeReason.trim() ||
              'User customized individual preferences in Interactive Preference Centre',
            source: 'User',
          });
          setServerPrefs(res.data.preferences);
          setSummary(res.data.summary);
          setChangeReason('');
          await refreshSession();
          addToast(res.data.message, 'success', 'Preferences Saved');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to save preferences.', 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // Accept All Optional Preferences
  const triggerAcceptAll = () => {
    setModalConfig({
      isOpen: true,
      title: 'Accept All Optional Consent Categories',
      description:
        'You are about to enable Analytics, Marketing, Personalization, and Third-Party Data Sharing under the active Privacy Notice. You may withdraw consent at any time.',
      variant: 'primary',
      confirmText: 'Accept All Preferences',
      details: [
        { label: 'Essential Cookies', value: 'Always Active' },
        { label: 'Analytics & Marketing', value: 'Enabled (Granted)' },
        { label: 'Personalization & 3rd-Party', value: 'Enabled (Granted)' },
        { label: 'Audit Source', value: 'User (Preference Centre)' },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.post('/consent/accept-all', {
            reason: changeReason.trim() || 'User accepted all optional preference categories',
            source: 'User',
          });
          const pref = res.data.preferences;
          setServerPrefs(pref);
          setDraftPrefs({
            essential: true,
            analytics: true,
            marketing: true,
            personalization: true,
            thirdPartySharing: true,
          });
          setSummary(res.data.summary);
          setChangeReason('');
          await refreshSession();
          addToast(res.data.message, 'success', 'All Preferences Accepted');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to accept preferences.', 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // Reject All Optional Preferences
  const triggerRejectOptional = () => {
    setModalConfig({
      isOpen: true,
      title: 'Reject All Optional Preferences',
      description:
        'All optional tracking and data-sharing categories will be immediately disabled. Only strictly necessary Essential Cookies will remain active.',
      variant: 'warning',
      confirmText: 'Reject All Optional',
      details: [
        { label: 'Essential Cookies', value: 'Always Active (Protected)' },
        { label: 'All 4 Optional Categories', value: 'Disabled' },
        { label: 'Privacy Notice Version', value: `v${activeNoticeInfo?.version || '2.0'}` },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.post('/consent/reject-optional', {
            reason: changeReason.trim() || 'User rejected all optional preferences',
            source: 'User',
          });
          const pref = res.data.preferences;
          setServerPrefs(pref);
          setDraftPrefs({
            essential: true,
            analytics: false,
            marketing: false,
            personalization: false,
            thirdPartySharing: false,
          });
          setSummary(res.data.summary);
          setChangeReason('');
          await refreshSession();
          addToast(res.data.message, 'info', 'Optional Preferences Rejected');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to reject optional preferences.', 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // Formal GDPR/CCPA Right to Withdraw Consent
  const triggerWithdrawAllConsent = () => {
    setModalConfig({
      isOpen: true,
      title: 'Exercise Formal Right to Withdraw Consent',
      description:
        'Under GDPR Art. 7(3), CCPA, and India DPDP Act, withdrawing consent revokes all previously granted optional permissions and records an immutable "Consent Withdrawn" event in the audit ledger while preserving historical compliance records.',
      variant: 'danger',
      confirmText: 'Withdraw All Optional Consent',
      details: [
        { label: 'Action Type', value: 'Consent Withdrawn' },
        { label: 'Target Categories', value: 'Analytics, Marketing, Personalization, 3rd-Party' },
        { label: 'Historical Audit Trail', value: 'Preserved (Append-Only)' },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.post('/consent/withdraw', {
            reason:
              changeReason.trim() ||
              'User formally exercised statutory Right-to-Withdraw across all optional categories',
          });
          const pref = res.data.preferences;
          setServerPrefs(pref);
          setDraftPrefs({
            essential: true,
            analytics: false,
            marketing: false,
            personalization: false,
            thirdPartySharing: false,
          });
          setSummary(res.data.summary);
          setChangeReason('');
          await refreshSession();
          addToast(res.data.message, 'warning', 'Consent Withdrawn & Logged');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to withdraw consent.', 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  if (loading && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Quick Bulk Actions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interactive Consent & Preference Centre
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">
            Manage how your data is processed across 5 granular privacy categories. Every change is
            wrapped in a MongoDB transaction and appended to the SHA-256 audit trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={triggerAcceptAll}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept All Optional</span>
          </button>
          <button
            type="button"
            onClick={triggerRejectOptional}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Optional</span>
          </button>
          <button
            type="button"
            onClick={triggerWithdrawAllConsent}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Withdraw Consent</span>
          </button>
        </div>
      </div>

      {/* Live Summary Section (Total, Enabled, Disabled, Withdrawn) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Preferences
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {liveCounts.total}
            </span>
            <span className="text-xs font-medium text-slate-500">1 Mandatory • 4 Optional</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Enabled Preferences
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {liveCounts.enabled}
            </span>
            <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">
              Active Consent
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Disabled Preferences
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">
              {liveCounts.disabled}
            </span>
            <span className="text-xs font-medium text-slate-400">Opted-Out</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Withdrawn Consents
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {liveCounts.withdrawn}
            </span>
            <span className="text-xs font-medium text-rose-500">Revoked by User</span>
          </div>
        </div>
      </div>

      {/* 5 Preference Category Cards */}
      <div className="space-y-4">
        {(summary?.categories || []).map((cat) => {
          const isEssential = cat.key === 'essential';
          const isEnabled = isEssential ? true : Boolean(draftPrefs[cat.key]);
          const serverEnabled = isEssential ? true : Boolean(serverPrefs?.[cat.key]);
          const isModified = isEnabled !== serverEnabled;

          let badgeStyle =
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
          let badgeText = cat.statusBadge;

          if (isEssential) {
            badgeStyle =
              'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            badgeText = 'Always Active (Mandatory)';
          } else if (isModified) {
            badgeStyle =
              'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
            badgeText = isEnabled ? 'Pending Grant (Unsaved)' : 'Pending Withdrawal (Unsaved)';
          } else if (isEnabled) {
            badgeStyle =
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            badgeText = 'Consent Granted';
          } else if (cat.statusBadge === 'Withdrawn') {
            badgeStyle =
              'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
            badgeText = 'Consent Withdrawn';
          }

          return (
            <div
              key={cat.key}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
                isModified
                  ? 'border-indigo-500 ring-2 ring-indigo-500/15'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
                    >
                      {badgeText}
                    </span>
                    {isEssential && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <Lock className="w-3 h-3" /> Strictly Necessary
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Last Modified:{' '}
                      <strong className="text-slate-600 dark:text-slate-300 font-mono">
                        {new Date(cat.lastModified).toLocaleString()}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Current State:{' '}
                      <strong
                        className={
                          isEnabled
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Interactive Toggle Switch */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => handleToggleCategory(cat.key)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEssential
                        ? 'bg-indigo-600/80 cursor-not-allowed'
                        : isEnabled
                        ? 'bg-emerald-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Audit Reason + Save Changes Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Optional Reason for Change (Recorded in Immutable ConsentLog)
          </label>
          <input
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            placeholder="e.g., Disabling marketing cookies after Q4 campaign review..."
            className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 shrink-0">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={() =>
                setDraftPrefs({
                  essential: true,
                  analytics: Boolean(serverPrefs.analytics),
                  marketing: Boolean(serverPrefs.marketing),
                  personalization: Boolean(serverPrefs.personalization),
                  thirdPartySharing: Boolean(serverPrefs.thirdPartySharing),
                })
              }
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Discard Unsaved Changes
            </button>
          )}

          <button
            type="button"
            onClick={triggerSaveCustomPreferences}
            disabled={!hasUnsavedChanges || saving}
            className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all ${
              hasUnsavedChanges
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Preferences...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((m) => ({ ...m, isOpen: false }))}
        onConfirm={modalConfig.actionHandler}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        confirmText={modalConfig.confirmText}
        details={modalConfig.details}
        loading={saving}
      />
    </div>
  );
};

export default PreferenceCentrePage;

