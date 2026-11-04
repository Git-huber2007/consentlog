import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  PlusCircle,
  MinusCircle,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const VersionComparisonPage = () => {
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [baseVersion, setBaseVersion] = useState('1.0');
  const [targetVersion, setTargetVersion] = useState('2.0');
  const [comparisonData, setComparisonData] = useState(null);
  const [baseNoticeDoc, setBaseNoticeDoc] = useState(null);
  const [targetNoticeDoc, setTargetNoticeDoc] = useState(null);
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
        const [baseRes, targetRes] = await Promise.all([
          api.get(`/notices/${baseVersion}`),
          api.get(`/notices/${targetVersion}`, { params: { compareWith: baseVersion } }),
        ]);
        setBaseNoticeDoc(baseRes.data.notice);
        setTargetNoticeDoc(targetRes.data.notice);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Privacy Notice Side-by-Side Version Comparison
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare any two Privacy Notice versions to inspect newly added clauses, removed legacy
            provisions, and modified data processing terms.
          </p>
        </div>

        <Link
          to="/notices"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 self-start lg:self-center"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notice Centre</span>
        </Link>
      </div>

      {/* Version Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm grid md:grid-cols-11 gap-4 items-center">
        <div className="md:col-span-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Baseline Version (Left Column)
          </label>
          <select
            value={baseVersion}
            onChange={(e) => setBaseVersion(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {notices.map((n) => (
              <option key={n.version} value={n.version}>
                Version {n.version} — {n.title} ({n.status})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 flex justify-center pt-4">
          <div className="p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5">
            Target Version (Right Column)
          </label>
          <select
            value={targetVersion}
            onChange={(e) => setTargetVersion(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-indigo-400 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/30 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {notices.map((n) => (
              <option key={n.version} value={n.version}>
                Version {n.version} — {n.title} ({n.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
              Newly Added Clauses
            </span>
            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
              +{summary.addedClauses ?? 0}
            </p>
          </div>
          <PlusCircle className="w-7 h-7 text-emerald-500" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
              Modified Clauses
            </span>
            <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">
              ~{summary.modifiedClauses ?? 0}
            </p>
          </div>
          <Edit3 className="w-7 h-7 text-amber-500" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">
              Removed Clauses
            </span>
            <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
              -{summary.removedClauses ?? 0}
            </p>
          </div>
          <MinusCircle className="w-7 h-7 text-rose-500" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Unchanged Clauses</span>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">
              {summary.unchangedClauses ?? 0}
            </p>
          </div>
          <CheckCircle2 className="w-7 h-7 text-slate-400" />
        </div>
      </div>

      {/* Side-by-Side Clause Diff Matrix */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Clause-by-Clause Side-by-Side Diff (v{baseVersion} vs v{targetVersion})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Computing clause-level cryptographic diff...
          </div>
        ) : (
          clauses.map((item) => {
            const badgeMap = {
              ADDED: 'bg-emerald-500 text-white',
              MODIFIED: 'bg-amber-500 text-slate-950',
              REMOVED: 'bg-rose-500 text-white',
              UNCHANGED: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
            };

            return (
              <div
                key={item.clauseId}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {item.clauseId}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.heading}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      badgeMap[item.changeType]
                    }`}
                  >
                    {item.changeType}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                  {/* Left: Base Version */}
                  <div
                    className={`p-5 text-xs space-y-2 ${
                      item.changeType === 'REMOVED'
                        ? 'bg-rose-50/60 dark:bg-rose-950/20'
                        : item.changeType === 'MODIFIED'
                        ? 'bg-amber-50/40 dark:bg-amber-950/15'
                        : ''
                    }`}
                  >
                    <div className="font-mono text-[11px] font-bold text-slate-400">
                      VERSION {baseVersion}
                    </div>
                    {item.oldClause ? (
                      <>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {item.oldClause.heading}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.oldClause.body}
                        </p>
                      </>
                    ) : (
                      <p className="italic text-slate-400">
                        Not present in Version {baseVersion} (Added in v{targetVersion})
                      </p>
                    )}
                  </div>

                  {/* Right: Target Version */}
                  <div
                    className={`p-5 text-xs space-y-2 ${
                      item.changeType === 'ADDED'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/25'
                        : item.changeType === 'MODIFIED'
                        ? 'bg-amber-50/60 dark:bg-amber-950/25'
                        : ''
                    }`}
                  >
                    <div className="font-mono text-[11px] font-bold text-indigo-500">
                      VERSION {targetVersion}
                    </div>
                    {item.newClause ? (
                      <>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {item.newClause.heading}
                        </p>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                          {item.newClause.body}
                        </p>
                      </>
                    ) : (
                      <p className="italic text-rose-500">
                        Clause removed in Version {targetVersion}
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

