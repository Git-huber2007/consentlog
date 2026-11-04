import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Lock,
  Save,
  RotateCcw,
  Clock,
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

  const computeLiveCounts = () => {
    const optionalKeys = ['analytics', 'marketing', 'personalization', 'thirdPartySharing'];
    let enabled = 1;
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

  const triggerSaveCustomPreferences = () => {
    if (!hasUnsavedChanges) {
      addToast('No preference modifications to save.', 'info');
      return;
    }

    const modifiedList = ['analytics', 'marketing', 'personalization', 'thirdPartySharing']
      .filter((k) => Boolean(draftPrefs[k]) !== Boolean(serverPrefs[k]))
      .map((k) => ({
        label: summary?.categories?.find((c) => c.key === k)?.name || k,
        value: `${serverPrefs[k] ? 'Enabled' : 'Disabled'} -> ${
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
        <div className="h-20 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        <div className="h-20 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Bulk Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Preference Matrix
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Manage how your data is processed across 5 granular privacy categories. Every change is
            wrapped in a MongoDB transaction and appended to the SHA-256 audit trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerAcceptAll}
            className="px-3.5 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accept All Optional</span>
          </button>
          <button
            type="button"
            onClick={triggerRejectOptional}
            className="px-3.5 py-2 rounded-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject Optional</span>
          </button>
          <button
            type="button"
            onClick={triggerWithdrawAllConsent}
            className="px-3.5 py-2 rounded-md bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Withdraw Consent</span>
          </button>
        </div>
      </div>

      {/* Unified 4-Column Telemetry Strip */}
      <div className="enterprise-card grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/80">
        <div className="p-4">
          <span className="text-xs text-zinc-500 block">Total Categories</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {liveCounts.total}
            </span>
            <span className="text-[11px] text-zinc-500">1 Mandatory · 4 Optional</span>
          </div>
        </div>

        <div className="p-4">
          <span className="text-xs text-zinc-500 block">Active Consents</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {liveCounts.enabled}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Opted-In
            </span>
          </div>
        </div>

        <div className="p-4">
          <span className="text-xs text-zinc-500 block">Disabled Categories</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {liveCounts.disabled}
            </span>
            <span className="text-[11px] text-zinc-500">Opted-Out</span>
          </div>
        </div>

        <div className="p-4">
          <span className="text-xs text-zinc-500 block">Withdrawn Consents</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {liveCounts.withdrawn}
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400">Revoked</span>
          </div>
        </div>
      </div>

      {/* 5 Preference Category Rows */}
      <div className="enterprise-card divide-y divide-zinc-200 dark:divide-zinc-800/80">
        {(summary?.categories || []).map((cat) => {
          const isEssential = cat.key === 'essential';
          const isEnabled = isEssential ? true : Boolean(draftPrefs[cat.key]);
          const serverEnabled = isEssential ? true : Boolean(serverPrefs?.[cat.key]);
          const isModified = isEnabled !== serverEnabled;

          let badgeStyle =
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
          let badgeText = cat.statusBadge;

          if (isEssential) {
            badgeStyle =
              'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100';
            badgeText = 'Required';
          } else if (isModified) {
            badgeStyle =
              'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
            badgeText = isEnabled ? 'Unsaved Grant' : 'Unsaved Withdrawal';
          } else if (isEnabled) {
            badgeStyle =
              'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
            badgeText = 'Granted';
          } else if (cat.statusBadge === 'Withdrawn') {
            badgeStyle =
              'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
            badgeText = 'Withdrawn';
          }

          return (
            <div
              key={cat.key}
              className={`p-5 transition-colors ${
                isModified ? 'bg-amber-500/[0.03]' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {cat.name}
                    </h3>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${badgeStyle}`}
                    >
                      {badgeText}
                    </span>
                    {isEssential && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                        <Lock className="w-3 h-3" /> Strictly Necessary
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      Modified: {new Date(cat.lastModified).toLocaleString()}
                    </span>
                    <span>·</span>
                    <span>
                      State:{' '}
                      <strong
                        className={
                          isEnabled
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Interactive Toggle Switch */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-mono text-zinc-500">
                    {isEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => handleToggleCategory(cat.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEssential
                        ? 'bg-zinc-900 dark:bg-zinc-100 cursor-not-allowed opacity-70'
                        : isEnabled
                        ? 'bg-emerald-500'
                        : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow transition duration-200 ease-in-out ${
                        isEssential
                          ? 'bg-white dark:bg-zinc-950 translate-x-5'
                          : isEnabled
                          ? 'bg-white translate-x-5'
                          : 'bg-white translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Reason + Save Changes Bar */}
      <div className="enterprise-card p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sticky bottom-4 z-20 shadow-lg">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Audit Note (Optional, recorded in SHA-256 ledger)
          </label>
          <input
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            placeholder="e.g., Disabling marketing cookies after Q4 campaign review..."
            className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 shrink-0">
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
              className="px-3.5 py-2 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={triggerSaveCustomPreferences}
            disabled={!hasUnsavedChanges || saving}
            className={`px-5 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-opacity ${
              hasUnsavedChanges
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Committing Block...' : 'Commit Preference Changes'}</span>
          </button>
        </div>
      </div>

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
