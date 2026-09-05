import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { Domain } from '../types';
import { DomainDetailsModal } from './DomainDetailsModal';
import {
  Globe,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
  Users,
  GitFork,
  HardDrive,
  Key,
} from 'lucide-react';

export const DomainsView: React.FC = () => {
  const { domains, users, aliases, addDomain, updateDomain, deleteDomain } = useVawayMail();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  // New domain form state
  const [formData, setFormData] = useState({
    name: '',
    max_users: -1,
    max_aliases: -1,
    max_quota_gb: 10,
    signup_enabled: false,
    anonmail_enabled: true,
    comment: '',
  });

  const filteredDomains = domains.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.comment && d.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addDomain({
      name: formData.name.trim().toLowerCase(),
      max_users: Number(formData.max_users),
      max_aliases: Number(formData.max_aliases),
      max_quota_bytes: Number(formData.max_quota_gb) * 1024 * 1024 * 1024,
      signup_enabled: formData.signup_enabled,
      anonmail_enabled: formData.anonmail_enabled,
      comment: formData.comment.trim(),
    });

    setFormData({
      name: '',
      max_users: -1,
      max_aliases: -1,
      max_quota_gb: 10,
      signup_enabled: false,
      anonmail_enabled: true,
      comment: '',
    });
    setIsAddModalOpen(false);
  };

  const handleUpdateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomain) return;

    updateDomain(editingDomain.name, {
      max_users: editingDomain.max_users,
      max_aliases: editingDomain.max_aliases,
      max_quota_bytes: editingDomain.max_quota_bytes,
      signup_enabled: editingDomain.signup_enabled,
      anonmail_enabled: editingDomain.anonmail_enabled,
      comment: editingDomain.comment,
    });
    setEditingDomain(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            Mail Domains
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage domains served by VAWAY. Each domain can host mailboxes, aliases, and custom DKIM/SPF DNS policies.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-500 ml-2" />
        <input
          type="text"
          placeholder="Filter domains by name or comment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 w-full focus:outline-none"
        />
      </div>

      {/* Domain Cards / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Domain Name</th>
                <th className="py-3 px-4">Mailboxes</th>
                <th className="py-3 px-4">Aliases</th>
                <th className="py-3 px-4">Quota Limit</th>
                <th className="py-3 px-4">Features</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No domains found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredDomains.map((domain) => {
                  const domainUsers = users.filter((u) => u.domain_name.toLowerCase() === domain.name.toLowerCase());
                  const domainAliases = aliases.filter((a) => a.domain_name.toLowerCase() === domain.name.toLowerCase());
                  const quotaGb = domain.max_quota_bytes > 0 ? (domain.max_quota_bytes / (1024 * 1024 * 1024)).toFixed(0) + ' GB' : 'Unlimited';

                  return (
                    <tr key={domain.name} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white text-sm">{domain.name}</span>
                        </div>
                        {domain.comment && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{domain.comment}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {domainUsers.length} / {domain.max_users === -1 ? '∞' : domain.max_users}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {domainAliases.length} / {domain.max_aliases === -1 ? '∞' : domain.max_aliases}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                          <span>{quotaGb}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {domain.signup_enabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Public Signup
                            </span>
                          )}
                          {domain.anonmail_enabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              Anonmail
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            DKIM Ready
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDomain(domain)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-medium transition-colors"
                            title="View DNS Records & DKIM"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>DNS Details</span>
                          </button>
                          <button
                            onClick={() => setEditingDomain(domain)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Domain Limits"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete domain ${domain.name}? This will remove all associated users, aliases, and alternative mappings.`)) {
                                deleteDomain(domain.name);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Domain"
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

      {/* Add Domain Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Mail Domain</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDomain} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Domain Name (FQDN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mycompany.com"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Mailboxes (-1 = unlimited)</label>
                  <input
                    type="number"
                    value={formData.max_users}
                    onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || -1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Aliases (-1 = unlimited)</label>
                  <input
                    type="number"
                    value={formData.max_aliases}
                    onChange={(e) => setFormData({ ...formData, max_aliases: parseInt(e.target.value) || -1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Total Domain Storage Quota (GB)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.max_quota_gb}
                  onChange={(e) => setFormData({ ...formData, max_quota_gb: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.anonmail_enabled}
                    onChange={(e) => setFormData({ ...formData, anonmail_enabled: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Enable Anonmail (Allow API-generated privacy aliases)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.signup_enabled}
                    onChange={(e) => setFormData({ ...formData, signup_enabled: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Enable Public User Self-Registration</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Comment / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Primary marketing domain"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors"
                >
                  Save Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Domain Modal */}
      {editingDomain && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Domain: {editingDomain.name}</h3>
              <button onClick={() => setEditingDomain(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDomain} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Users</label>
                  <input
                    type="number"
                    value={editingDomain.max_users}
                    onChange={(e) => setEditingDomain({ ...editingDomain, max_users: parseInt(e.target.value) || -1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Aliases</label>
                  <input
                    type="number"
                    value={editingDomain.max_aliases}
                    onChange={(e) => setEditingDomain({ ...editingDomain, max_aliases: parseInt(e.target.value) || -1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Comment</label>
                <input
                  type="text"
                  value={editingDomain.comment || ''}
                  onChange={(e) => setEditingDomain({ ...editingDomain, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingDomain.anonmail_enabled}
                    onChange={(e) => setEditingDomain({ ...editingDomain, anonmail_enabled: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600"
                  />
                  <span>Anonmail Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingDomain.signup_enabled}
                    onChange={(e) => setEditingDomain({ ...editingDomain, signup_enabled: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600"
                  />
                  <span>Public Signup Enabled</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDomain(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details modal with DNS records */}
      {selectedDomain && (
        <DomainDetailsModal
          domain={selectedDomain}
          onClose={() => setSelectedDomain(null)}
        />
      )}
    </div>
  );
};
