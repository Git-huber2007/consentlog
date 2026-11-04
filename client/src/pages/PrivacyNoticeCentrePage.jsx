import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  GitCompare,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  BookOpen,
} from 'lucide-react';
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
        method: 'Privacy Notice Centre Review',
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
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Versioned Privacy Notice Repository
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review active and historical privacy notices (v1.0, v1.1, v2.0), inspect clause-level
            change summaries, and verify your explicit acceptance status.
          </p>
        </div>

        <Link
          to="/notices/compare"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 self-start lg:self-center"
        >
          <GitCompare className="w-4 h-4" />
          <span>Compare Versions Side-by-Side</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Version History List */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Published Notice Lineage ({notices.length} Versions)
          </h2>

          {notices.map((notice) => {
            const isSelected = selectedNotice?.version === notice.version;
            const accepted = notice.userAcceptance?.accepted;

            return (
              <button
                key={notice.version}
                type="button"
                onClick={() => setSelectedNotice(notice)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-indigo-600 ring-2 ring-indigo-600/15 shadow-md'
                    : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                      v{notice.version}
                    </span>
                    {notice.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500 text-white">
                        Currently Active
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      accepted
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : notice.isActive
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {accepted
                      ? `Accepted (${notice.userAcceptance.status})`
                      : notice.isActive
                      ? 'Renewal Required'
                      : 'Archived'}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {notice.title}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {notice.summaryOfChanges}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Effective: {new Date(notice.effectiveDate).toLocaleDateString()}</span>
                  {accepted && notice.userAcceptance?.acceptedAt && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Signed {new Date(notice.userAcceptance.acceptedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Selected Notice Full Reader */}
        <div className="lg:col-span-8">
          {selectedNotice && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Top Reader Header */}
              <div className="p-6 bg-navy-900 text-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 font-mono font-bold text-xs text-indigo-300">
                      VERSION {selectedNotice.version}
                    </span>
                    <span className="text-xs text-slate-300">
                      Status: <strong>{selectedNotice.status}</strong>
                    </span>
                  </div>

                  {selectedNotice.userAcceptance?.accepted ? (
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Accepted on{' '}
                        {new Date(selectedNotice.userAcceptance.acceptedAt).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(selectedNotice.version)}
                      disabled={acknowledging}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {acknowledging
                          ? 'Recording Acceptance...'
                          : `Accept & Sign Notice v${selectedNotice.version}`}
                      </span>
                    </button>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {selectedNotice.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span>
                    Published:{' '}
                    <strong>{new Date(selectedNotice.publicationDate).toLocaleDateString()}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Effective Date:{' '}
                    <strong>{new Date(selectedNotice.effectiveDate).toLocaleDateString()}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Author: <strong>{selectedNotice.publishedBy}</strong>
                  </span>
                </div>
              </div>

              {/* Change Summary & Highlights */}
              <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Executive Summary of Changes (v{selectedNotice.version})
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {selectedNotice.summaryOfChanges}
                  </p>
                  {selectedNotice.highlights && selectedNotice.highlights.length > 0 && (
                    <ul className="pt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {selectedNotice.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Structured Clauses */}
                {selectedNotice.clauses && selectedNotice.clauses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Structured Regulatory Clauses ({selectedNotice.clauses.length})
                    </h3>
                    {selectedNotice.clauses.map((clause) => (
                      <div
                        key={clause.clauseId}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {clause.heading}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {clause.clauseId} • {clause.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {clause.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Full Verbatim Legal Text */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Full Verbatim Notice Document
                  </h3>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800">
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

