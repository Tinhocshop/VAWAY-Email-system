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
  const { users, domains, deleteUser, setCurrentAccount } = useVawayMail();
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
      u.displayed_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1a73e8]" />
            Mailboxes & User Accounts
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Provision email accounts, adjust quotas, manage passwords, and configure vacation auto-replies.
          </p>
        </div>
        <button
          onClick={() => setModalUser(null)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Mailbox
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white border border-[#dadce0] p-2.5 rounded-2xl shadow-xs">
          <Search className="w-4 h-4 text-[#5f6368] ml-2" />
          <input
            type="text"
            placeholder="Search mailboxes by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-[#202124] placeholder-[#5f6368] w-full focus:outline-none"
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="bg-white border border-[#dadce0] text-xs text-[#202124] font-medium px-4 py-2.5 rounded-2xl shadow-xs focus:outline-none focus:border-[#1a73e8]"
        >
          <option value="all">All Domains ({domains.length})</option>
          {domains.map((d) => (
            <option key={d.name} value={d.name}>
              @{d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafd] border-b border-[#dadce0] text-[#5f6368] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Storage Quota</th>
                <th className="py-3.5 px-4">Status & Features</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dadce0]/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#5f6368] text-xs">
                    No mailbox found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const usedPct =
                    user.quota_bytes > 0 ? Math.min(100, Math.round(((user.quota_used_bytes || 0) / user.quota_bytes) * 100)) : 0;

                  return (
                    <tr key={user.email} className="hover:bg-[#f8fafd] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-xs">
                            {user.displayed_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#202124]">{user.displayed_name}</div>
                            <div className="font-mono text-[11px] text-[#5f6368]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[#202124] bg-[#f1f3f4] px-2 py-0.5 rounded-md text-[11px]">
                          @{user.domain_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-36">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-[#202124] font-medium">{formatBytes(user.quota_used_bytes || 0)}</span>
                            <span className="text-[#5f6368]">of {formatBytes(user.quota_bytes)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#f1f3f4] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                usedPct > 85 ? 'bg-[#d93025]' : usedPct > 60 ? 'bg-[#f29900]' : 'bg-[#1a73e8]'
                              }`}
                              style={{ width: `${usedPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {user.enabled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] font-medium flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Suspended
                            </span>
                          )}
                          {user.auto_reply_enabled && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] bg-[#fef7e0] text-[#b06000] border border-[#feefc3] font-medium flex items-center gap-1"
                              title={user.auto_reply_body}
                            >
                              <Plane className="w-3 h-3" /> Auto-Reply
                            </span>
                          )}
                          {user.forward_enabled && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] font-medium flex items-center gap-1"
                              title={`Forwarding to ${user.forward_destination?.join(', ')}`}
                            >
                              <Forward className="w-3 h-3" /> Fwd
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setCurrentAccount(user.email);
                              if (onNavigate) onNavigate('inbox');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#c2e7ff] hover:bg-[#b3dcf7] text-[#001d35] rounded-full text-xs font-semibold transition-colors"
                            title="Open in Gmail Webmail"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#0b57d0]" />
                            <span>Webmail</span>
                          </button>
                          <button
                            onClick={() => setModalUser(user)}
                            className="p-1.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
                            title="Edit User"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete mailbox for ${user.email}? This will remove all stored messages.`)) {
                                deleteUser(user.email);
                              }
                            }}
                            className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-red-50 rounded-full transition-colors"
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

      {modalUser !== undefined && (
        <UserModal user={modalUser} onClose={() => setModalUser(undefined)} />
      )}
    </div>
  );
};
