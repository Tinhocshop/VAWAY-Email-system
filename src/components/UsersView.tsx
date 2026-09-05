import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { User } from '../types';
import { UserModal } from './UserModal';
import {
  Users,
  Plus,
  Search,
  Settings2,
  Trash2,
  ShieldAlert,
  Plane,
  Forward,
  Mail,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ViewType } from './Sidebar';

interface UsersViewProps {
  onNavigate?: (view: ViewType) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onNavigate }) => {
  const { users, domains, deleteUser, updateUser, setCurrentAccount } = useVawayMail();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [modalUser, setModalUser] = useState<User | null | undefined>(undefined); // undefined = closed, null = create, User = edit

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredUsers = users.filter((u) => {
    const matchesDomain = selectedDomain === 'all' || u.domain_name.toLowerCase() === selectedDomain.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayed_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.comment && u.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Mailboxes & User Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage individual mail storage boxes, quota allowances, vacation auto-replies, and forwarding rules.
          </p>
        </div>
        <button
          onClick={() => setModalUser(null)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Mailbox
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] border-b sm:border-b-0 sm:border-r border-slate-800 pb-2 sm:pb-0 pr-2">
          <span className="text-xs text-slate-400 font-medium">Domain:</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 rounded px-2 py-1 border border-slate-700 focus:outline-none flex-1"
          >
            <option value="all">All Domains ({domains.length})</option>
            {domains.map((d) => (
              <option key={d.name} value={d.name}>
                @{d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full flex-1">
          <Search className="w-4 h-4 text-slate-500 ml-1" />
          <input
            type="text"
            placeholder="Search by email, name, or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 w-full focus:outline-none"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Mailbox User</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Storage Quota</th>
                <th className="py-3 px-4">Protocols & Badges</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No mailboxes found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const used = user.quota_used_bytes || 0;
                  const limit = user.quota_bytes;
                  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

                  return (
                    <tr key={user.email} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400">
                            {user.displayed_name.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 font-mono text-xs">
                              {user.email}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {user.displayed_name}
                              {user.comment && ` • ${user.comment}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="py-3 px-4 text-slate-300 font-mono text-xs">
                        {user.domain_name}
                      </td>

                      {/* Quota */}
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="text-[11px] text-slate-300 flex items-center justify-between mb-1">
                          <span>{formatBytes(used)}</span>
                          <span className="text-slate-500">
                            {limit > 0 ? formatBytes(limit) : 'Unlimited'}
                          </span>
                        </div>
                        {limit > 0 && (
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct > 85 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-sky-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Flags & Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {user.global_admin && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-medium">
                              <ShieldAlert className="w-3 h-3" />
                              Global Admin
                            </span>
                          )}
                          {user.auto_reply_enabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium">
                              <Plane className="w-3 h-3" />
                              Vacation
                            </span>
                          )}
                          {user.forward_enabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1 font-medium">
                              <Forward className="w-3 h-3" />
                              Forwarding
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                            {user.enable_imap ? 'IMAP' : ''}
                            {user.enable_imap && user.enable_pop ? '/' : ''}
                            {user.enable_pop ? 'POP' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updateUser(user.email, { enabled: !user.enabled })}
                          className="flex items-center gap-1 text-[11px] font-medium"
                        >
                          {user.enabled ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400">
                              <XCircle className="w-3.5 h-3.5" />
                              Suspended
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setCurrentAccount(user.email);
                              if (onNavigate) onNavigate('webmail');
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors"
                            title="Open Webmail as this user"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setModalUser(user)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                            title="Edit Mailbox"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete mailbox ${user.email}? This action cannot be undone.`)) {
                                deleteUser(user.email);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Delete Mailbox"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {modalUser !== undefined && (
        <UserModal
          userToEdit={modalUser}
          domains={domains}
          onClose={() => setModalUser(undefined)}
        />
      )}
    </div>
  );
};
