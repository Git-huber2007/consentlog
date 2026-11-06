import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, GitCompare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PrivacyNoticeCentrePage = () => {
  const { refreshSession } = useAuth();
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      const list = res.data.notices || [];
      setNotices(list);
      const active = list.find((n) => n.isActive) || list[0];
      setSelectedNotice((prev) =>
        prev ? list.find((n) => n.version === prev.version) || active : active
      );
    } catch (err) {
      addToast('Failed to load privacy notices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAcknowledge = async (version) => {
    setAcknowledging(true);
    try {
      const res = await api.post('/notices/acknowledge', {
        version,
        method: 'Privacy Notice Review',
      });
      addToast(res.data.message, 'success', 'Notice Accepted');
      await fetchNotices();
      await refreshSession();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to accept notice.', 'error');
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading && notices.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
          <div className="lg:col-span-8 h-96 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Privacy Notices
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Read current and past privacy notices, see what changed, and accept the active version.
          </p>
        </div>

        <Link
          to="/notices/compare"
          className="px-3.5 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 flex items-center gap-2 self-start lg:self-auto"
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare Versions</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 px-1">
            Versions ({notices.length})
          </h2>

          {notices.map((notice) => {
            const isSelected = selectedNotice?.version === notice.version;
            const accepted = notice.userAcceptance?.accepted;

            return (
              <button
                key={notice.version}
                type="button"
                onClick={() => setSelectedNotice(notice)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-white dark:bg-[#111113] border-zinc-900 dark:border-zinc-100 shadow-xs'
                    : 'bg-white/60 dark:bg-[#111113]/60 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      v{notice.version}
                    </span>
                    {notice.isActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        Active
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      accepted
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : notice.isActive
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {accepted
                      ? 'Accepted'
                      : notice.isActive
                      ? 'Needs Review'
                      : 'Archived'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-2">
                  {notice.title}
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {notice.summaryOfChanges}
                </p>

                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Effective {new Date(notice.effectiveDate).toLocaleDateString()}</span>
                  {accepted && notice.userAcceptance?.acceptedAt && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Accepted {new Date(notice.userAcceptance.acceptedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8">
          {selectedNotice && (
            <div className="luxury-card overflow-hidden">
              <div className="p-6 bg-zinc-900 dark:bg-zinc-950 text-white border-b border-zinc-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono font-semibold text-xs text-zinc-200">
                      v{selectedNotice.version}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Status: <strong className="text-zinc-100">{selectedNotice.status}</strong>
                    </span>
                  </div>

                  {selectedNotice.userAcceptance?.accepted ? (
                    <div className="px-3 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        Accepted on{' '}
                        {new Date(selectedNotice.userAcceptance.acceptedAt).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(selectedNotice.version)}
                      disabled={acknowledging}
                      className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {acknowledging
                          ? 'Saving...'
                          : `Accept v${selectedNotice.version}`}
                      </span>
                    </button>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white">{selectedNotice.title}</h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
                  <span>
                    Published: {new Date(selectedNotice.publicationDate).toLocaleDateString()}
                  </span>
                  <span>·</span>
                  <span>
                    Effective: {new Date(selectedNotice.effectiveDate).toLocaleDateString()}
                  </span>
                  <span>·</span>
                  <span>Author: {selectedNotice.publishedBy}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    What Changed in v{selectedNotice.version}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {selectedNotice.summaryOfChanges}
                  </p>
                  {selectedNotice.highlights && selectedNotice.highlights.length > 0 && (
                    <ul className="pt-1 space-y-1 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                      {selectedNotice.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedNotice.clauses && selectedNotice.clauses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-zinc-500">
                      Clauses ({selectedNotice.clauses.length})
                    </h3>
                    {selectedNotice.clauses.map((clause) => (
                      <div
                        key={clause.clauseId}
                        className="p-4 rounded-md bg-zinc-50/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {clause.heading}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {clause.clauseId} · {clause.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {clause.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-500">
                    Full Text
                  </h3>
                  <pre className="p-4 rounded-md bg-zinc-950 text-zinc-200 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-zinc-800">
                    {selectedNotice.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyNoticeCentrePage;
