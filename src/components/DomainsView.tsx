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

  const filteredDomains = domains.filter(
    (d) =>
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
    <div className="space-y-5 select-none">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#1a73e8]" />
            Mail Domains
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Manage custom domains served by VAWAY Mail. Each domain includes full DKIM/SPF DNS policies, mailbox limits, and alias routing.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white border border-[#dadce0] p-2.5 rounded-2xl shadow-xs">
        <Search className="w-4 h-4 text-[#5f6368] ml-2" />
        <input
          type="text"
          placeholder="Filter domains by name or comment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-xs text-[#202124] placeholder-[#5f6368] w-full focus:outline-none"
        />
      </div>

      {/* Domain Cards / Table */}
      <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafd] border-b border-[#dadce0] text-[#5f6368] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Domain Name</th>
                <th className="py-3.5 px-4">Mailboxes</th>
                <th className="py-3.5 px-4">Aliases</th>
                <th className="py-3.5 px-4">Quota Limit</th>
                <th className="py-3.5 px-4">Features</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dadce0]/60">
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5f6368] text-xs">
                    No domains found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredDomains.map((domain) => {
                  const domainUsers = users.filter((u) => u.domain_name.toLowerCase() === domain.name.toLowerCase());
                  const domainAliases = aliases.filter((a) => a.domain_name.toLowerCase() === domain.name.toLowerCase());
                  const quotaGb =
                    domain.max_quota_bytes > 0
                      ? (domain.max_quota_bytes / (1024 * 1024 * 1024)).toFixed(0) + ' GB'
                      : 'Unlimited';

                  return (
                    <tr key={domain.name} className="hover:bg-[#f8fafd] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#202124]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#202124] font-semibold text-sm">{domain.name}</span>
                        </div>
                        {domain.comment && (
                          <div className="text-[11px] text-[#5f6368] mt-0.5">{domain.comment}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#5f6368]">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#1a73e8]" />
                          <span>
                            {domainUsers.length} / {domain.max_users === -1 ? '∞' : domain.max_users}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#5f6368]">
                        <div className="flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5 text-[#188038]" />
                          <span>
                            {domainAliases.length} / {domain.max_aliases === -1 ? '∞' : domain.max_aliases}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#5f6368]">
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-[#f29900]" />
                          <span>{quotaGb}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {domain.signup_enabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-medium">
                              Signup
                            </span>
                          )}
                          {domain.anonmail_enabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] font-medium">
                              Anonmail
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#f8fafd] text-[#5f6368] border border-[#dadce0] font-medium">
                            DKIM 2048
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDomain(domain)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-full text-xs font-semibold transition-colors"
                            title="View DNS Records & DKIM"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>DNS Details</span>
                          </button>
                          <button
                            onClick={() => setEditingDomain(domain)}
                            className="p-1.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
                            title="Edit Domain Limits"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete domain ${domain.name}? This will remove all associated users, aliases, and alternative mappings.`
                                )
                              ) {
                                deleteDomain(domain.name);
                              }
                            }}
                            className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-red-50 rounded-full transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#dadce0] overflow-hidden">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Add Mail Domain</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDomain} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Domain Name (FQDN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. company.com"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] placeholder-[#5f6368] focus:outline-none focus:border-[#1a73e8] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5f6368] font-semibold mb-1">Max Mailboxes (-1 = unlimited)</label>
                  <input
                    type="number"
                    value={formData.max_users}
                    onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || -1 })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
                <div>
                  <label className="block text-[#5f6368] font-semibold mb-1">Max Quota (GB)</label>
                  <input
                    type="number"
                    value={formData.max_quota_gb}
                    onChange={(e) => setFormData({ ...formData, max_quota_gb: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.anonmail_enabled}
                    onChange={(e) => setFormData({ ...formData, anonmail_enabled: e.target.checked })}
                    className="rounded text-[#1a73e8] focus:ring-[#1a73e8]"
                  />
                  <span className="text-[#202124] font-medium">Enable Anonymous Aliases</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.signup_enabled}
                    onChange={(e) => setFormData({ ...formData, signup_enabled: e.target.checked })}
                    className="rounded text-[#1a73e8] focus:ring-[#1a73e8]"
                  />
                  <span className="text-[#202124] font-medium">Allow Public Registration</span>
                </label>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Comment / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Primary corporate domain"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="pt-3 border-t border-[#dadce0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold shadow-xs"
                >
                  Create Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Domain Modal */}
      {editingDomain && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#dadce0] overflow-hidden">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Edit Domain: {editingDomain.name}</h3>
              <button onClick={() => setEditingDomain(null)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDomain} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5f6368] font-semibold mb-1">Max Mailboxes (-1 = unlimited)</label>
                  <input
                    type="number"
                    value={editingDomain.max_users}
                    onChange={(e) => setEditingDomain({ ...editingDomain, max_users: parseInt(e.target.value) || -1 })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124]"
                  />
                </div>
                <div>
                  <label className="block text-[#5f6368] font-semibold mb-1">Max Quota (GB)</label>
                  <input
                    type="number"
                    value={(editingDomain.max_quota_bytes / (1024 * 1024 * 1024)).toFixed(0)}
                    onChange={(e) =>
                      setEditingDomain({
                        ...editingDomain,
                        max_quota_bytes: (parseInt(e.target.value) || 10) * 1024 * 1024 * 1024,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDomain.anonmail_enabled}
                    onChange={(e) => setEditingDomain({ ...editingDomain, anonmail_enabled: e.target.checked })}
                    className="rounded text-[#1a73e8]"
                  />
                  <span className="text-[#202124] font-medium">Enable Anonymous Aliases</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDomain.signup_enabled}
                    onChange={(e) => setEditingDomain({ ...editingDomain, signup_enabled: e.target.checked })}
                    className="rounded text-[#1a73e8]"
                  />
                  <span className="text-[#202124] font-medium">Allow Public Registration</span>
                </label>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Comment</label>
                <input
                  type="text"
                  value={editingDomain.comment || ''}
                  onChange={(e) => setEditingDomain({ ...editingDomain, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124]"
                />
              </div>

              <div className="pt-3 border-t border-[#dadce0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDomain(null)}
                  className="px-4 py-2 bg-[#f1f3f4] text-[#202124] rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDomain && (
        <DomainDetailsModal domain={selectedDomain} onClose={() => setSelectedDomain(null)} />
      )}
    </div>
  );
};
