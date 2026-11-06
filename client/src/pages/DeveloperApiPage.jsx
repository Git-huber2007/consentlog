import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Code2,
  Play,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const DeveloperApiPage = () => {
  const { addToast } = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  // New key modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState(null);
  const [copied, setCopied] = useState(false);

  // Live test sandbox state
  const [testEmail, setTestEmail] = useState('alex@enterprise.io');
  const [testCategory, setTestCategory] = useState('marketing');
  const [testing, setTesting] = useState(false);
  const [testResponse, setTestResponse] = useState(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/api-keys');
      setKeys(res.data.keys || []);
    } catch (err) {
      addToast('Could not load API keys.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!keyName) return;
    try {
      const res = await api.post('/admin/api-keys', { name: keyName });
      setGeneratedSecret(res.data.apiKey.rawKey);
      addToast('API Key generated successfully.', 'success');
      fetchKeys();
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not generate API key.', 'error');
    }
  };

  const handleRevokeKey = async (id) => {
    try {
      await api.delete(`/admin/api-keys/${id}`);
      addToast('API Key revoked.', 'info');
      setKeys((prev) => prev.filter((k) => k._id !== id));
    } catch (err) {
      addToast('Could not revoke API key.', 'error');
    }
  };

  const handleRunLiveCheck = async () => {
    setTesting(true);
    setTestResponse(null);
    try {
      // Use active key if available or make call through client
      const activeKey = keys[0];
      const headers = activeKey && generatedSecret ? { 'X-API-Key': generatedSecret } : {};
      const res = await api.get(
        `/v1/consent/check?email=${encodeURIComponent(testEmail)}&category=${testCategory}`,
        { headers }
      );
      setTestResponse(res.data);
    } catch (err) {
      setTestResponse(err.response?.data || { error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Copied to clipboard.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Key className="size-5 text-emerald-500" />
            <span>Developer API Keys & Live Verification</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Issue cryptographically authenticated API keys for backend services, mobile apps, and microservices to verify consent in real time.
          </p>
        </div>

        <button
          onClick={() => {
            setKeyName('');
            setGeneratedSecret(null);
            setIsModalOpen(true);
          }}
          className="h-9 px-3.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs flex items-center gap-1.5 hover:opacity-90 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Live Interactive Verification Console */}
      <div className="enterprise-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-emerald-500" />
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Live External Verification Sandbox (GET /api/v1/consent/check)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">REST v1</span>
        </div>

        <div className="grid sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Data Subject Email
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111113] font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              Category
            </label>
            <select
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-zinc-900 dark:text-zinc-100 outline-none"
            >
              <option value="marketing">Marketing Cookies</option>
              <option value="analytics">Analytics Cookies</option>
              <option value="thirdPartySharing">Third-Party Data Sharing</option>
              <option value="personalization">Personalization</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={handleRunLiveCheck}
              disabled={testing}
              className="w-full h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="size-3" />
              <span>{testing ? 'Verifying...' : 'Check Status'}</span>
            </button>
          </div>
        </div>

        {testResponse && (
          <div className="mt-3 p-4 rounded-md bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800 pb-1.5">
              <span>HTTP 200 OK — Real-time Verification Proof</span>
              <span className={testResponse.isAllowed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {testResponse.isAllowed ? '● CONSENT GRANTED' : '○ CONSENT DENIED / WITHDRAWN'}
              </span>
            </div>
            <pre className="text-[11px] text-zinc-300 leading-relaxed">
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Code Snippet Card */}
      <div className="enterprise-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Sample Microservice Integration (cURL)
            </h2>
          </div>
          <button
            onClick={() =>
              copyToClipboard(
                `curl -X GET "https://api.consentlog.io/api/v1/consent/check?email=user@company.com&category=marketing" \\\n  -H "X-API-Key: cl_live_YOUR_SECRET_KEY"`
              )
            }
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
          >
            <Copy className="size-3" />
            <span>Copy Snippet</span>
          </button>
        </div>

        <div className="p-3.5 rounded-md bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
          <code>
            curl -X GET &quot;https://api.consentlog.io/api/v1/consent/check?email=user@company.com&category=marketing&quot; \<br />
            &nbsp;&nbsp;-H &quot;X-API-Key: cl_live_YOUR_SECRET_KEY&quot;
          </code>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Active Enterprise API Keys ({keys.length})
          </h2>
          <button
            onClick={fetchKeys}
            disabled={loading}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
          >
            <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {keys.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No API keys generated yet. Click &quot;Generate API Key&quot; to issue your first server credentials.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4">Key Name</th>
                  <th className="py-2.5 px-4">Prefix</th>
                  <th className="py-2.5 px-4">Organization</th>
                  <th className="py-2.5 px-4">Created</th>
                  <th className="py-2.5 px-4">Last Used</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                {keys.map((k) => (
                  <tr key={k._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {k.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                      {k.prefix}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {k.organization}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(k._id)}
                        className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="enterprise-card max-w-md w-full shadow-2xl overflow-hidden">
            {!generatedSecret ? (
              <form onSubmit={handleGenerateKey}>
                <div className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Key className="size-4" />
                    <span>Generate External API Key</span>
                  </h3>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Key Label / Service Name
                    </label>
                    <input
                      type="text"
                      required
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="e.g., Marketing Mailer Service"
                      className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                    />
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
                    className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs hover:opacity-90"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-4" />
                  <h3 className="text-base font-bold">API Key Generated</h3>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Please copy this key now. For security purposes, it will never be displayed again.
                </p>

                <div className="p-3 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <code className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all select-all">
                    {generatedSecret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedSecret)}
                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0"
                    title="Copy API Key"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs"
                  >
                    I Have Stored It Securely
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperApiPage;
