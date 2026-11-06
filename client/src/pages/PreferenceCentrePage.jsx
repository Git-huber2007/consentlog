import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Lock,
  Save,
  RotateCcw,
  Clock,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

const PreferenceCentrePage = () => {
  const { addToast } = useToast();
  const { refreshSession, activeNoticeInfo } = useAuth();

  const [serverPrefs, setServerPrefs] = useState(null);
  const [retention, setRetention] = useState(null);
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
      const [res, retRes] = await Promise.all([
        api.get('/preferences'),
        api.get('/consent/retention').catch(() => ({ data: null })),
      ]);
      const pref = res.data.preferences;
      setServerPrefs(pref);
      if (retRes?.data?.success) {
        setRetention(retRes.data);
      }
      setDraftPrefs({
        essential: true,
        analytics: Boolean(pref.analytics),
        marketing: Boolean(pref.marketing),
        personalization: Boolean(pref.personalization),
        thirdPartySharing: Boolean(pref.thirdPartySharing),
      });
      setSummary(res.data.summary);
    } catch (err) {
      addToast('Could not load your preferences.', 'error');
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
      addToast('Essential cookies are required for sign-in and security.', 'warning');
      return;
    }
    setDraftPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const triggerSaveCustomPreferences = () => {
    if (!hasUnsavedChanges) {
      addToast('No changes to save.', 'info');
      return;
    }

    const modifiedList = ['analytics', 'marketing', 'personalization', 'thirdPartySharing']
      .filter((k) => Boolean(draftPrefs[k]) !== Boolean(serverPrefs[k]))
      .map((k) => ({
        label: summary?.categories?.find((c) => c.key === k)?.name || k,
        value: `${serverPrefs[k] ? 'Enabled' : 'Disabled'} -> ${
          draftPrefs[k] ? 'Enabled' : 'Disabled'
        }`,
      }));

    const hasWithdrawal = modifiedList.some((m) => m.value.endsWith('Disabled'));

    setModalConfig({
      isOpen: true,
      title: 'Save preference changes?',
      description:
        'Your updated choices will take effect immediately and will be added to your consent history.',
      variant: hasWithdrawal ? 'warning' : 'primary',
      confirmText: 'Save Changes',
      details: [
        ...modifiedList,
        { label: 'Notice Version', value: `v${activeNoticeInfo?.version || '2.0'}` },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.put('/preferences', {
            ...draftPrefs,
            reason: changeReason.trim() || 'Updated preferences',
            source: 'User',
          });
          setServerPrefs(res.data.preferences);
          setSummary(res.data.summary);
          setChangeReason('');
          await refreshSession();
          addToast('Preferences saved.', 'success');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Could not save preferences.', 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const triggerAcceptAll = () => {
    setModalConfig({
      isOpen: true,
      title: 'Accept all categories?',
      description:
        'This enables Analytics, Marketing, Personalization, and Third-Party Sharing. You can turn any of them off later.',
      variant: 'primary',
      confirmText: 'Accept All',
      details: [
        { label: 'Essential Cookies', value: 'Always Active' },
        { label: 'Optional Categories (4)', value: 'Enabled' },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.post('/consent/accept-all', {
            reason: changeReason.trim() || 'Accepted all categories',
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
          addToast('All categories enabled.', 'success');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Could not update preferences.', 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const triggerRejectOptional = () => {
    setModalConfig({
      isOpen: true,
      title: 'Reject optional categories?',
      description:
        'All optional categories will be turned off. Only Essential Cookies will remain active.',
      variant: 'warning',
      confirmText: 'Reject Optional',
      details: [
        { label: 'Essential Cookies', value: 'Always Active' },
        { label: 'Optional Categories (4)', value: 'Disabled' },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.post('/consent/reject-optional', {
            reason: changeReason.trim() || 'Rejected optional categories',
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
          addToast('Optional categories disabled.', 'info');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Could not update preferences.', 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const triggerWithdrawAllConsent = () => {
    setModalConfig({
      isOpen: true,
      title: 'Withdraw all optional consent?',
      description:
        'This revokes all previously granted optional permissions and records the withdrawal in your consent history.',
      variant: 'danger',
      confirmText: 'Withdraw Consent',
      details: [
        { label: 'Action', value: 'Consent Withdrawn' },
        { label: 'Categories', value: 'Analytics, Marketing, Personalization, 3rd-Party' },
      ],
      actionHandler: async () => {
        setSaving(true);
        try {
          const res = await api.post('/consent/withdraw', {
            reason: changeReason.trim() || 'Withdrew all optional consent',
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
          addToast('Consent withdrawn.', 'warning');
          setModalConfig((m) => ({ ...m, isOpen: false }));
        } catch (err) {
          addToast(err.response?.data?.message || 'Could not withdraw consent.', 'error');
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
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Privacy Preferences
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Choose which categories of cookies and data processing you allow. You can update or withdraw your consent at any time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerAcceptAll}
            className="px-3.5 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accept All</span>
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
            <span>Withdraw All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="luxury-card p-4.5 rounded-2xl flex flex-col justify-between group cursor-default relative overflow-hidden bg-gradient-to-b from-indigo-500/[0.05] dark:from-indigo-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
          <div className="flex items-center justify-between mb-3 pt-0.5">
            <div className="size-8 rounded-xl flex items-center justify-center border shadow-2xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-500/25">
              <Layers className="size-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-500/20">
              Total
            </span>
          </div>
          <div>
            <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {liveCounts.total}
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Categories</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">1 Required · 4 Optional</p>
          </div>
        </div>

        <div className="luxury-card p-4.5 rounded-2xl flex flex-col justify-between group cursor-default relative overflow-hidden bg-gradient-to-b from-emerald-500/[0.05] dark:from-emerald-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between mb-3 pt-0.5">
            <div className="size-8 rounded-xl flex items-center justify-center border shadow-2xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/25">
              <CheckCircle2 className="size-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-500/20">
              Active
            </span>
          </div>
          <div>
            <span className="font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
              {liveCounts.enabled}
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Enabled Categories</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Data processing allowed</p>
          </div>
        </div>

        <div className="luxury-card p-4.5 rounded-2xl flex flex-col justify-between group cursor-default relative overflow-hidden bg-gradient-to-b from-slate-500/[0.05] dark:from-slate-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <div className="flex items-center justify-between mb-3 pt-0.5">
            <div className="size-8 rounded-xl flex items-center justify-center border shadow-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700">
              <XCircle className="size-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700">
              Off
            </span>
          </div>
          <div>
            <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {liveCounts.disabled}
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Disabled</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tracking blocked</p>
          </div>
        </div>

        <div className="luxury-card p-4.5 rounded-2xl flex flex-col justify-between group cursor-default relative overflow-hidden bg-gradient-to-b from-rose-500/[0.05] dark:from-rose-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
          <div className="flex items-center justify-between mb-3 pt-0.5">
            <div className="size-8 rounded-xl flex items-center justify-center border shadow-2xs bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-500/25">
              <AlertCircle className="size-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border bg-rose-50/80 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-500/20">
              Revoked
            </span>
          </div>
          <div>
            <span className="font-mono text-3xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
              {liveCounts.withdrawn}
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Withdrawn Rights</p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Explicit revocation</p>
          </div>
        </div>
      </div>

      {retention && (
        <div className="enterprise-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-md ${
              retention.isExpired
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : retention.isExpiringSoon
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {retention.jurisdiction} Retention Lifecycle ({retention.retentionMonths}-Month Mandate)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  retention.isExpired
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : retention.isExpiringSoon
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {retention.status}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                {retention.isExpired
                  ? 'Consent has expired under regulatory limits. Please save updated preferences.'
                  : `Valid for another ${retention.daysRemaining} days (expires ${new Date(retention.expiresAt).toLocaleDateString()}).`}
              </p>
            </div>
          </div>
          {retention.isExpiringSoon || retention.isExpired ? (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs hover:opacity-90 shrink-0"
            >
              Renew Consent Now
            </button>
          ) : null}
        </div>
      )}

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
            badgeText = 'Unsaved';
          } else if (isEnabled) {
            badgeStyle =
              'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
            badgeText = 'Enabled';
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
                        <Lock className="w-3 h-3" /> Always on
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(cat.lastModified).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-mono text-zinc-500">
                    {isEnabled ? 'On' : 'Off'}
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

      <div className="enterprise-card p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sticky bottom-4 z-20 shadow-lg">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            placeholder="Reason for updating your preferences..."
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
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
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
