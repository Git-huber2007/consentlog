import React, { useState } from 'react';
import {
  Monitor,
  Code,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BannerSimulatorPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'embed'
  const [layout, setLayout] = useState('bottom-bar'); // 'bottom-bar' | 'floating-card' | 'center-modal'
  const [bannerTheme, setBannerTheme] = useState('dark'); // 'dark' | 'light'
  const [jurisdiction, setJurisdiction] = useState(user?.jurisdiction || 'GDPR (EU)');
  const [showPreferences, setShowPreferences] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const [simulatedPrefs, setSimulatedPrefs] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false,
    thirdPartySharing: false,
  });

  const [lastConsentEvent, setLastConsentEvent] = useState(null);

  const handleTogglePref = (key) => {
    if (key === 'essential') return;
    setSimulatedPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const recordSimulatedConsent = (action, updatedPrefs) => {
    const timestamp = new Date().toISOString();
    const event = {
      action,
      timestamp,
      jurisdiction,
      organization: user?.organization || 'Enterprise Global Corp',
      preferences: updatedPrefs,
      simulatedHash: Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
    };
    setLastConsentEvent(event);
    setBannerVisible(false);
    addToast(`Consent Recorded (${action})`, 'success');
  };

  const handleAcceptAll = () => {
    const allOn = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
      thirdPartySharing: true,
    };
    setSimulatedPrefs(allOn);
    recordSimulatedConsent('Accept All Optional', allOn);
  };

  const handleRejectOptional = () => {
    const essentialsOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
      thirdPartySharing: false,
    };
    setSimulatedPrefs(essentialsOnly);
    recordSimulatedConsent('Reject Optional', essentialsOnly);
  };

  const handleSaveCustom = () => {
    recordSimulatedConsent('Custom Selection Saved', simulatedPrefs);
  };

  const resetBanner = () => {
    setBannerVisible(true);
    setShowPreferences(false);
    setLastConsentEvent(null);
    addToast('Banner simulation reset.', 'info');
  };

  const embedScript = `<!-- ConsentLog v2.0 Client Banner -->
<script
  src="https://cdn.consentlog.io/v2/consentlog-banner.min.js"
  data-tenant="${encodeURIComponent(user?.organization || 'Enterprise Global Corp')}"
  data-layout="${layout}"
  data-theme="${bannerTheme}"
  data-jurisdiction="${jurisdiction}"
  data-api-endpoint="https://api.consentlog.io/v2/consent"
  async>
</script>`;

  const gtmSnippet = `// Google Tag Manager Consent Mode v2 Integration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'personalization_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});

window.addEventListener('consentlog:update', function(e) {
  gtag('consent', 'update', {
    'analytics_storage': e.detail.analytics ? 'granted' : 'denied',
    'ad_storage': e.detail.marketing ? 'granted' : 'denied',
    'ad_user_data': e.detail.marketing ? 'granted' : 'denied',
    'personalization_storage': e.detail.personalization ? 'granted' : 'denied'
  });
});`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    addToast('Snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Cookie Banner Simulator & Embed SDK
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              Live Interactive
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Preview, test, and customize the visitor-facing consent banner for your websites, then copy the embeddable SDK snippet for React, Next.js, and Google Tag Manager.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`h-9 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'simulator'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                : 'bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            <Monitor className="size-3.5" />
            <span>Interactive Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`h-9 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'embed'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                : 'bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            <Code className="size-3.5" />
            <span>Embed Snippets</span>
          </button>
        </div>
      </div>

      {activeTab === 'simulator' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="enterprise-card p-4 space-y-4">
              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="size-3.5 text-emerald-500" />
                <span>Banner Configuration</span>
              </h2>

              {/* Layout Mode */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1.5">Layout Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'bottom-bar', label: 'Bottom Bar' },
                    { id: 'floating-card', label: 'Floating' },
                    { id: 'center-modal', label: 'Modal' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLayout(l.id)}
                      className={`h-8 text-xs font-medium rounded-md border transition-colors ${
                        layout === l.id
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1.5">Color Theme</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['dark', 'light'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setBannerTheme(t)}
                      className={`h-8 text-xs font-medium rounded-md border capitalize transition-colors ${
                        bannerTheme === t
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {t} Mode
                    </button>
                  ))}
                </div>
              </div>

              {/* Regulatory Jurisdiction */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1.5">Regulatory Mode</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-zinc-800 dark:text-zinc-200 outline-none"
                >
                  <option value="GDPR (EU)">GDPR (EU) – Explicit Opt-in</option>
                  <option value="CCPA (California)">CCPA (California) – Opt-out Notice</option>
                  <option value="DPDP (India)">DPDP (India) – Explicit Consent Notice</option>
                  <option value="Global Standard">Global Standard</option>
                </select>
              </div>

              {/* Reset Banner Button */}
              <button
                onClick={resetBanner}
                className="w-full h-8 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset / Show Banner Again</span>
              </button>
            </div>

            {/* Last Recorded Event Box */}
            {lastConsentEvent && (
              <div className="enterprise-card p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="size-3.5" />
                    <span>Captured Consent Payload</span>
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {lastConsentEvent.timestamp.slice(11, 19)}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 text-zinc-200 font-mono text-[10px] leading-relaxed overflow-x-auto space-y-1">
                  <p className="text-zinc-400">Action: <span className="text-emerald-400">{lastConsentEvent.action}</span></p>
                  <p className="text-zinc-400">Tenant: <span className="text-zinc-200">{lastConsentEvent.organization}</span></p>
                  <p className="text-zinc-400">SHA-256 Simulated: <span className="text-purple-400">e3b0c442...{lastConsentEvent.simulatedHash}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Browser Simulator Canvas */}
          <div className="lg:col-span-8">
            <div className="enterprise-card overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col h-[520px]">
              {/* Browser chrome header */}
              <div className="h-9 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-rose-500/80" />
                  <div className="size-2.5 rounded-full bg-amber-500/80" />
                  <div className="size-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-5 px-4 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 shadow-2xs">
                  <span className="text-emerald-500">🔒</span>
                  <span>https://app.client-portal.com</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {user?.organization || 'Enterprise Global Corp'}
                </div>
              </div>

              {/* Simulated page content */}
              <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden flex flex-col justify-between">
                {/* Simulated webpage content */}
                <div className="space-y-4 max-w-lg opacity-40 select-none">
                  <div className="h-6 w-48 bg-zinc-300 dark:bg-zinc-800 rounded" />
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800/60 rounded" />
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800/60 rounded" />
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="h-20 bg-zinc-200 dark:bg-zinc-800/40 rounded-lg" />
                    <div className="h-20 bg-zinc-200 dark:bg-zinc-800/40 rounded-lg" />
                    <div className="h-20 bg-zinc-200 dark:bg-zinc-800/40 rounded-lg" />
                  </div>
                </div>

                {!bannerVisible && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-zinc-900/10 dark:bg-zinc-950/40 backdrop-blur-2xs">
                    <div className="p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-3 max-w-sm">
                      <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <Check className="size-5" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Consent Stored Successfully</h3>
                      <p className="text-xs text-zinc-500">
                        Preferences committed to tamper-evident audit ledger under {jurisdiction}.
                      </p>
                      <button
                        onClick={resetBanner}
                        className="h-8 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90"
                      >
                        Re-open Banner
                      </button>
                    </div>
                  </div>
                )}

                {/* THE SIMULATED CONSENT BANNER */}
                {bannerVisible && (
                  <div
                    className={`${
                      layout === 'bottom-bar'
                        ? 'absolute bottom-0 inset-x-0 border-t'
                        : layout === 'floating-card'
                        ? 'absolute bottom-4 right-4 max-w-md w-full border rounded-xl shadow-2xl'
                        : 'absolute inset-0 m-auto max-w-lg h-fit border rounded-xl shadow-2xl p-6'
                    } ${
                      bannerTheme === 'dark'
                        ? 'bg-zinc-900/95 text-zinc-100 border-zinc-700 backdrop-blur-md'
                        : 'bg-white/95 text-zinc-900 border-zinc-200 backdrop-blur-md shadow-lg'
                    } p-4 transition-all duration-300 z-10`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded bg-emerald-500 flex items-center justify-center text-white shrink-0">
                            <ShieldCheck className="size-3.5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold leading-tight">Privacy &amp; Cookie Preferences</h3>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              Governed by {jurisdiction} · {user?.organization || 'Enterprise Global Corp'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        We use strictly necessary cookies to ensure security, alongside optional telemetry and measurement to improve your experience. You have the right to withdraw consent at any time.
                      </p>

                      {showPreferences && (
                        <div className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-700/50 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-zinc-200">Strictly Necessary</p>
                              <p className="text-[10px] text-zinc-400">Security, session auth &amp; CSRF protection</p>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">ALWAYS ACTIVE</span>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800">
                            <div>
                              <p className="font-semibold text-zinc-200">Analytics Telemetry</p>
                              <p className="text-[10px] text-zinc-400">Aggregated usage metrics (zero PII)</p>
                            </div>
                            <button
                              onClick={() => handleTogglePref('analytics')}
                              className={`w-8 h-4 rounded-full transition-colors relative ${
                                simulatedPrefs.analytics ? 'bg-emerald-500' : 'bg-zinc-700'
                              }`}
                            >
                              <div
                                className={`size-3 rounded-full bg-white transition-transform ${
                                  simulatedPrefs.analytics ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800">
                            <div>
                              <p className="font-semibold text-zinc-200">Marketing &amp; Attribution</p>
                              <p className="text-[10px] text-zinc-400">Campaign measurement</p>
                            </div>
                            <button
                              onClick={() => handleTogglePref('marketing')}
                              className={`w-8 h-4 rounded-full transition-colors relative ${
                                simulatedPrefs.marketing ? 'bg-emerald-500' : 'bg-zinc-700'
                              }`}
                            >
                              <div
                                className={`size-3 rounded-full bg-white transition-transform ${
                                  simulatedPrefs.marketing ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Banner Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => setShowPreferences((prev) => !prev)}
                          className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2 flex items-center gap-1 font-medium"
                        >
                          <span>{showPreferences ? 'Hide Categories' : 'Customize Choices'}</span>
                          <ChevronDown className={`size-3 transition-transform ${showPreferences ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="flex items-center gap-2">
                          {showPreferences ? (
                            <button
                              onClick={handleSaveCustom}
                              className="h-7 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                            >
                              Save Choices
                            </button>
                          ) : (
                            <button
                              onClick={handleRejectOptional}
                              className="h-7 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                            >
                              Reject Optional
                            </button>
                          )}
                          <button
                            onClick={handleAcceptAll}
                            className="h-7 px-3.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs"
                          >
                            Accept All
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed SDK Tab */}
      {activeTab === 'embed' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="enterprise-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="size-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Universal HTML / Next.js Script Tag
                </h2>
              </div>
              <button
                onClick={() => copyToClipboard(embedScript)}
                className="h-8 px-3 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"
              >
                {copiedCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Tag'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Drop this script into your <code>&lt;head&gt;</code> or main HTML layout. It initializes the privacy banner according to your tenant configuration and automatically connects to ConsentLog's append-only ledger.
            </p>
            <pre className="p-4 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              {embedScript}
            </pre>
          </div>

          <div className="enterprise-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-purple-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Google Tag Manager (Consent Mode v2)
                </h2>
              </div>
              <button
                onClick={() => copyToClipboard(gtmSnippet)}
                className="h-8 px-3 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90"
              >
                {copiedCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy GTM Script'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Fully compliant with Google's Consent Mode v2 mandate for EU/EEA traffic. Dispatches `ad_storage` and `analytics_storage` updates dynamically when visitors interact with the banner.
            </p>
            <pre className="p-4 rounded-lg bg-zinc-950 text-purple-300 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              {gtmSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSimulatorPage;
