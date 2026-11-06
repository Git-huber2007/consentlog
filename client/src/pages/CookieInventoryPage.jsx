import React, { useState, useEffect } from 'react';
import {
  Cookie,
  Search,
  Scan,
  ShieldCheck,
  Globe,
  Clock,
  Lock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Trackers' },
  { id: 'essential', label: 'Essential' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'personalization', label: 'Personalization' },
  { id: 'thirdPartySharing', label: '3rd-Party' },
];

const CookieInventoryPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cookies, setCookies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Scanner state
  const [scanDomain, setScanDomain] = useState('portal.enterprise.io');
  const [scanning, setScanning] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/cookies');
      setCookies(res.data.cookies || []);
      setStats(res.data.stats || {});
    } catch (err) {
      addToast('Could not load cookie inventory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanDomain) return;
    setScanning(true);
    try {
      const res = await api.post('/admin/cookies/scan', { domain: scanDomain });
      addToast(res.data.message, 'success');
      fetchInventory();
    } catch (err) {
      addToast('Domain scan failed.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const filtered = cookies.filter((c) => {
    const matchCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.provider.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Cookie className="size-5 text-amber-500" />
            <span>Third-Party Cookie & Tracker Inventory</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Transparent registry of all first-party and third-party cookies, tracking scripts, and data retention durations.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={loading}
          className="h-8 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Domain Scanner Tool */}
      <div className="enterprise-card p-5 bg-zinc-50/50 dark:bg-zinc-900/30">
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Scan className="size-3.5 text-emerald-500" />
              <span>Live Domain Asset Scanner</span>
            </h2>
            <p className="text-[11px] text-zinc-500">
              Audit external web properties to discover newly injected tracking scripts and catalog them under compliant CMP categories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={scanDomain}
              onChange={(e) => setScanDomain(e.target.value)}
              placeholder="e.g., portal.mycompany.com"
              className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111113] font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none w-52 sm:w-64"
            />
            <button
              type="submit"
              disabled={scanning}
              className="h-8 px-3.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Scan className={`size-3 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Scan Domain'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Trackers', count: stats.total || 0, color: 'text-slate-900 dark:text-white', accent: 'from-slate-400 to-slate-600' },
          { label: 'Essential', count: stats.essential || 0, color: 'text-slate-900 dark:text-white', accent: 'from-indigo-500 to-blue-500' },
          { label: 'Analytics', count: stats.analytics || 0, color: 'text-emerald-600 dark:text-emerald-400', accent: 'from-emerald-500 to-teal-500' },
          { label: 'Marketing', count: stats.marketing || 0, color: 'text-amber-600 dark:text-amber-400', accent: 'from-amber-500 to-orange-500' },
          { label: 'Personalization', count: stats.personalization || 0, color: 'text-sky-600 dark:text-sky-400', accent: 'from-sky-500 to-cyan-500' },
          { label: '3rd-Party Sharing', count: stats.thirdPartySharing || 0, color: 'text-purple-600 dark:text-purple-400', accent: 'from-purple-500 to-pink-500' },
        ].map((item, idx) => (
          <div key={idx} className="luxury-card p-3.5 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent}`} />
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{item.label}</span>
            <span className={`font-mono text-2xl font-extrabold mt-1 block tabular-nums ${item.color}`}>
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeCategory === tab.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs">
            <Search className="size-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cookies or providers..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No cookies match your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500 font-medium">
                  <th className="py-2.5 px-4">Cookie / Identifier</th>
                  <th className="py-2.5 px-4">Provider</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Domain</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Security Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.name}
                      </span>
                      <p className="text-[11px] text-zinc-500 max-w-sm mt-0.5 leading-relaxed">
                        {c.description}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {c.provider}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                        c.category === 'essential'
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          : c.category === 'analytics'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : c.category === 'marketing'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : c.category === 'personalization'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {c.domain}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {c.duration}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {c.isHttpOnly && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            HttpOnly
                          </span>
                        )}
                        {c.isSecure && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Secure
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieInventoryPage;

