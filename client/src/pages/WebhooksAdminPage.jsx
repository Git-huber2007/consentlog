import React, { useState, useEffect } from 'react';
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AVAILABLE_EVENTS = [
  { id: 'consent.granted', label: 'Consent Granted', desc: 'Fires when optional preferences are enabled' },
  { id: 'consent.withdrawn', label: 'Consent Withdrawn', desc: 'Fires when user revokes permissions' },
  { id: 'notice.accepted', label: 'Notice Accepted', desc: 'Fires on privacy notice version signatures' },
  { id: 'user.erased', label: 'User Erased (Art. 17)', desc: 'Fires when DSAR anonymization occurs' },
];

const WebhooksAdminPage = () => {
  const { addToast } = useToast();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testingId, setTestingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    url: '',
    events: ['consent.granted', 'consent.withdrawn', 'user.erased'],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/webhooks');
      setWebhooks(res.data.webhooks || []);
    } catch (err) {
      addToast('Could not load webhooks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleToggleEvent = (id) => {
    setForm((prev) => {
      const exists = prev.events.includes(id);
      return {
        ...prev,
        events: exists ? prev.events.filter((e) => e !== id) : [...prev.events, id],
      };
    });
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    if (!form.name || !form.url) {
      addToast('Name and URL are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/webhooks', form);
      addToast('Webhook configured with HMAC-SHA256 signing secret.', 'success');
      setIsModalOpen(false);
      setForm({ name: '', url: '', events: ['consent.granted', 'consent.withdrawn', 'user.erased'] });
      fetchWebhooks();
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not create webhook.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestWebhook = async (id) => {
    setTestingId(id);
    try {
      const res = await api.post(`/admin/webhooks/${id}/test`);
      addToast(res.data.message || 'Test ping dispatched.', 'success');
      fetchWebhooks();
    } catch (err) {
      addToast('Test ping failed.', 'error');
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteWebhook = async (id) => {
    try {
      await api.delete(`/admin/webhooks/${id}`);
      addToast('Webhook removed.', 'info');
      setWebhooks((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      addToast('Could not delete webhook.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Downstream Webhooks & Integrations
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Synchronize real-time consent updates and opt-outs with downstream CRM, CDP, and data warehouse endpoints.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-3.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs flex items-center gap-1.5 hover:opacity-90 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          <span>Add Webhook</span>
        </button>
      </div>

      {/* Info card */}
      <div className="enterprise-card p-4 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-3">
        <Shield className="size-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            HMAC-SHA256 Cryptographic Payload Signing
          </p>
          <p className="leading-relaxed">
            Every outgoing webhook contains an <code className="font-mono text-[11px] bg-zinc-200/80 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-900 dark:text-zinc-100">X-ConsentLog-Signature</code> header generated using your secret key. Endpoints should compute the HMAC-SHA256 digest of the request body to verify origin authenticity.
          </p>
        </div>
      </div>

      {/* Webhook List */}
      <div className="enterprise-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Active Endpoints ({webhooks.length})
            </h2>
          </div>
          <button
            onClick={fetchWebhooks}
            disabled={loading}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
          >
            <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {webhooks.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No downstream webhooks registered yet. Click &quot;Add Webhook&quot; to configure your first destination.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {webhooks.map((w) => (
              <div key={w._id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {w.name}
                    </span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {w.organization}
                    </span>
                    {w.lastResponseStatus && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        w.lastResponseStatus === 200
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        HTTP {w.lastResponseStatus}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-zinc-500 truncate max-w-xl">
                    {w.url}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {w.events?.map((ev) => (
                      <span
                        key={ev}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => handleTestWebhook(w._id)}
                    disabled={testingId === w._id}
                    className="h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Send className={`size-3 ${testingId === w._id ? 'animate-pulse' : ''}`} />
                    <span>{testingId === w._id ? 'Pinging...' : 'Test Ping'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(w._id)}
                    className="size-8 inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="Delete webhook"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Webhook Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="enterprise-card max-w-lg w-full shadow-2xl overflow-hidden">
            <form onSubmit={handleCreateWebhook}>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <WebhookIcon className="size-4" />
                    <span>Add Webhook Destination</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Integration Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Segment Production CDP"
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Webhook Destination URL
                  </label>
                  <input
                    type="url"
                    required
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://api.yourcompany.com/webhooks/consent"
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111113] font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                    Subscribe to Event Triggers
                  </label>
                  <div className="space-y-2">
                    {AVAILABLE_EVENTS.map((ev) => {
                      const isChecked = form.events.includes(ev.id);
                      return (
                        <label
                          key={ev.id}
                          className="flex items-start gap-2.5 p-2 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleEvent(ev.id)}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-0"
                          />
                          <div className="text-xs">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {ev.label}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 ml-1.5">
                              ({ev.id})
                            </span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{ev.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhooksAdminPage;
