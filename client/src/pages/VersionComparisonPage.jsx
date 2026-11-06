import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const VersionComparisonPage = () => {
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [baseVersion, setBaseVersion] = useState('1.0');
  const [targetVersion, setTargetVersion] = useState('2.0');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await api.get('/notices');
        const list = res.data.notices || [];
        setNotices(list);
      } catch (err) {
        addToast('Failed to load notice versions.', 'error');
      }
    };
    loadNotices();
  }, [addToast]);

  useEffect(() => {
    const fetchDiff = async () => {
      if (!baseVersion || !targetVersion) return;
      setLoading(true);
      try {
        const [, targetRes] = await Promise.all([
          api.get(`/notices/${baseVersion}`),
          api.get(`/notices/${targetVersion}`, { params: { compareWith: baseVersion } }),
        ]);
        setComparisonData(targetRes.data.comparison);
      } catch (err) {
        addToast('Failed to compare selected versions.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDiff();
  }, [baseVersion, targetVersion, addToast]);

  const summary = comparisonData?.summary || {};
  const clauses = comparisonData?.clauseComparisons || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Compare Versions
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Compare two privacy notice versions side-by-side to see added, updated, or removed clauses.
          </p>
        </div>

        <Link
          to="/notices"
          className="px-3.5 py-2 rounded-md bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-1.5 self-start lg:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Notices</span>
        </Link>
      </div>

      <div className="luxury-card p-6 grid md:grid-cols-11 gap-4 items-center">
        <div className="md:col-span-5">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
            From Version
          </label>
          <select
            value={baseVersion}
            onChange={(e) => setBaseVersion(e.target.value)}
            className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none"
          >
            {notices.map((n) => (
              <option key={n.version} value={n.version}>
                v{n.version} - {n.title} ({n.status})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 flex justify-center pt-4">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1.5">
            To Version
          </label>
          <select
            value={targetVersion}
            onChange={(e) => setTargetVersion(e.target.value)}
            className="w-full px-3.5 py-2 rounded-md border border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
          >
            {notices.map((n) => (
              <option key={n.version} value={n.version}>
                v{n.version} - {n.title} ({n.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="luxury-card p-4.5 rounded-2xl relative overflow-hidden bg-gradient-to-b from-emerald-500/[0.05] dark:from-emerald-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Added Clauses</span>
          <p className="font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            +{summary.addedClauses ?? 0}
          </p>
        </div>

        <div className="luxury-card p-4.5 rounded-2xl relative overflow-hidden bg-gradient-to-b from-amber-500/[0.05] dark:from-amber-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">Modified Clauses</span>
          <p className="font-mono text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            ~{summary.modifiedClauses ?? 0}
          </p>
        </div>

        <div className="luxury-card p-4.5 rounded-2xl relative overflow-hidden bg-gradient-to-b from-rose-500/[0.05] dark:from-rose-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">Removed Clauses</span>
          <p className="font-mono text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            -{summary.removedClauses ?? 0}
          </p>
        </div>

        <div className="luxury-card p-4.5 rounded-2xl relative overflow-hidden bg-gradient-to-b from-slate-500/[0.05] dark:from-slate-500/[0.08] to-transparent">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Unchanged</span>
          <p className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
            {summary.unchangedClauses ?? 0}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Changes (v{baseVersion} vs v{targetVersion})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500 enterprise-card">
            Comparing versions...
          </div>
        ) : (
          clauses.map((item) => {
            const badgeMap = {
              ADDED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
              MODIFIED: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
              REMOVED: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
              UNCHANGED: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
            };

            return (
              <div key={item.clauseId} className="enterprise-card overflow-hidden">
                <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-semibold text-xs text-zinc-500">
                      {item.clauseId}
                    </span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {item.heading}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      badgeMap[item.changeType]
                    }`}
                  >
                    {item.changeType}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800/80">
                  <div
                    className={`p-5 text-xs space-y-2 ${
                      item.changeType === 'REMOVED'
                        ? 'bg-rose-500/[0.04]'
                        : item.changeType === 'MODIFIED'
                        ? 'bg-amber-500/[0.03]'
                        : ''
                    }`}
                  >
                    <div className="font-mono text-[11px] text-zinc-500">
                      v{baseVersion}
                    </div>
                    {item.oldClause ? (
                      <>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {item.oldClause.heading}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {item.oldClause.body}
                        </p>
                      </>
                    ) : (
                      <p className="italic text-zinc-400">
                        Not in v{baseVersion}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-5 text-xs space-y-2 ${
                      item.changeType === 'ADDED'
                        ? 'bg-emerald-500/[0.04]'
                        : item.changeType === 'MODIFIED'
                        ? 'bg-amber-500/[0.04]'
                        : ''
                    }`}
                  >
                    <div className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
                      v{targetVersion}
                    </div>
                    {item.newClause ? (
                      <>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.newClause.heading}
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {item.newClause.body}
                        </p>
                      </>
                    ) : (
                      <p className="italic text-rose-500">
                        Removed in v{targetVersion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VersionComparisonPage;
