import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, CheckCircle2, XCircle, ShieldCheck, History, Globe } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const UserManagementPage = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        addToast('Failed to load registered users.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [addToast]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organization || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderBadge = (enabled, label) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
        enabled
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      {enabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Registered Users & Granular Consent Directory
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Inspect real-time consent status by user, active notice acceptance, and audit event
            counts. (Admin Read-Only Inspection — Ownership protection prevents unauthorized user
            preference tampering).
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user name, email, org..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">User & Organization</th>
                <th className="py-3.5 px-4">Role & Jurisdiction</th>
                <th className="py-3.5 px-4">Granular Preference Matrix (5 Categories)</th>
                <th className="py-3.5 px-4">Active Notice Acceptance</th>
                <th className="py-3.5 px-4">Audit Events</th>
                <th className="py-3.5 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading user consent directory...
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.organization}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {u.role}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{u.jurisdiction || 'GDPR (EU)'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {renderBadge(true, 'Essential')}
                        {renderBadge(u.preferences?.analytics, 'Analytics')}
                        {renderBadge(u.preferences?.marketing, 'Marketing')}
                        {renderBadge(u.preferences?.personalization, 'Personalization')}
                        {renderBadge(u.preferences?.thirdPartySharing, '3rd-Party')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {u.preferences?.enabledCount || 1} of 5 categories active
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {u.acceptedActiveNotice ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accepted v{u.activeNoticeVersion}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px]">
                          Pending v{u.activeNoticeVersion} Renewal
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {u.auditEventCount} blocks
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(u.lastActivityAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;

