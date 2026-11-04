import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, XCircle, Globe } from 'lucide-react';
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
        addToast('Failed to load users.', 'error');
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
        enabled
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400'
      }`}
    >
      {enabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Users
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            View user consent preferences, accepted privacy notice versions, and activity counts.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or organization..."
            className="w-full pl-8 pr-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
          />
        </div>
      </div>

      <div className="enterprise-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80 text-[11px] font-medium text-zinc-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role & Region</th>
                <th className="py-3 px-4">Preferences</th>
                <th className="py-3 px-4">Notice</th>
                <th className="py-3 px-4">Log Entries</th>
                <th className="py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Loading users...
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {u.name?.replace(/\s*\(Chief Privacy Officer\)/i, '')}
                      </div>
                      <div className="text-zinc-500 font-mono text-[11px]">{u.email}</div>
                      <div className="text-[11px] text-zinc-400">{u.organization}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase ${
                          u.role === 'admin'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {u.role}
                      </span>
                      <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{u.jurisdiction || 'GDPR (EU)'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {renderBadge(true, 'Essential')}
                        {renderBadge(u.preferences?.analytics, 'Analytics')}
                        {renderBadge(u.preferences?.marketing, 'Marketing')}
                        {renderBadge(u.preferences?.personalization, 'Personalization')}
                        {renderBadge(u.preferences?.thirdPartySharing, '3rd-Party')}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {u.preferences?.enabledCount || 1} of 5 enabled
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.acceptedActiveNotice ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Accepted v{u.activeNoticeVersion}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium text-[11px]">
                          Pending v{u.activeNoticeVersion}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {u.auditEventCount}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500 tabular-nums">
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
