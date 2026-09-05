import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  GitFork,
  Plus,
  Search,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

export const AliasesView: React.FC = () => {
  const {
    aliases,
    addAlias,
    deleteAlias,
    domains,
    users,
    anonAliases,
    addAnonAlias,
    toggleAnonAlias,
    deleteAnonAlias,
  } = useVawayMail();

  const [activeTab, setActiveTab] = useState<'standard' | 'anon'>('standard');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Standard alias modal
  const [isAddStandardOpen, setIsAddStandardOpen] = useState(false);
  const [aliasLocalpart, setAliasLocalpart] = useState('');
  const [aliasDomain, setAliasDomain] = useState(domains[0]?.name || '');
  const [aliasDestinations, setAliasDestinations] = useState('');
  const [aliasWildcard, setAliasWildcard] = useState(false);
  const [aliasComment, setAliasComment] = useState('');
  const [formError, setFormError] = useState('');

  // Anon alias generator modal
  const [isAddAnonOpen, setIsAddAnonOpen] = useState(false);
  const [anonTargetUser, setAnonTargetUser] = useState(users[0]?.email || '');
  const [anonDomain, setAnonDomain] = useState(domains[0]?.name || '');
  const [anonDesc, setAnonDesc] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateStandardAlias = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!aliasLocalpart.trim() || !aliasDestinations.trim()) {
      setFormError('Alias name and at least one destination address are required.');
      return;
    }

    const fullEmail = `${aliasLocalpart.trim().toLowerCase()}@${aliasDomain.toLowerCase()}`;
    const destinations = aliasDestinations
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    const success = addAlias({
      email: fullEmail,
      localpart: aliasLocalpart.trim().toLowerCase(),
      domain_name: aliasDomain.toLowerCase(),
      destination: destinations,
      wildcard: aliasWildcard,
      comment: aliasComment.trim(),
    });

    if (!success) {
      setFormError(`Alias ${fullEmail} already exists.`);
      return;
    }

    setAliasLocalpart('');
    setAliasDestinations('');
    setAliasWildcard(false);
    setAliasComment('');
    setIsAddStandardOpen(false);
  };

  const handleCreateAnonAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonTargetUser) return;

    addAnonAlias(anonTargetUser, anonDomain, anonDesc.trim() || 'Shopping & Subscriptions');

    setAnonDesc('');
    setIsAddAnonOpen(false);
  };

  const filteredAliases = aliases.filter(
    (a) =>
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.destination.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.comment && a.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAnonAliases = anonAliases.filter(
    (a) =>
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.target_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-[#1a73e8]" />
            Aliases & Virtual Forwarders
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Route incoming messages to one or multiple destinations, or generate privacy-protecting burner aliases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'standard' ? (
            <button
              onClick={() => setIsAddStandardOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Forwarding Alias
            </button>
          ) : (
            <button
              onClick={() => setIsAddAnonOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-semibold transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Generate Anonmail
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#dadce0] gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('standard')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'standard'
              ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <GitFork className="w-4 h-4" />
          Standard Aliases ({aliases.length})
        </button>
        <button
          onClick={() => setActiveTab('anon')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'anon'
              ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Anonmail Burner Aliases ({anonAliases.length})
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-[#dadce0] p-2.5 rounded-2xl shadow-xs">
        <Search className="w-4 h-4 text-[#5f6368] ml-2" />
        <input
          type="text"
          placeholder="Filter aliases by email, target, or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-xs text-[#202124] placeholder-[#5f6368] w-full focus:outline-none"
        />
      </div>

      {/* Standard Aliases Table */}
      {activeTab === 'standard' && (
        <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafd] border-b border-[#dadce0] text-[#5f6368] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Source Alias</th>
                  <th className="py-3.5 px-4">Forward Destination(s)</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0]/60">
                {filteredAliases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#5f6368] text-xs">
                      No aliases found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredAliases.map((a) => (
                    <tr key={a.email} className="hover:bg-[#f8fafd] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#202124]">
                        <span className="font-mono text-[#202124] font-semibold">{a.email}</span>
                        {a.comment && <div className="text-[11px] text-[#5f6368] mt-0.5">{a.comment}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {a.destination.map((dest) => (
                            <span
                              key={dest}
                              className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] font-mono"
                            >
                              {dest}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {a.wildcard ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#fef7e0] text-[#b06000] border border-[#feefc3] font-medium">
                            Catch-all Wildcard
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-medium">
                            Direct Mapping
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete alias ${a.email}?`)) {
                              deleteAlias(a.email);
                            }
                          }}
                          className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Alias"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anonmail Table */}
      {activeTab === 'anon' && (
        <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafd] border-b border-[#dadce0] text-[#5f6368] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Anonymous Burner Address</th>
                  <th className="py-3.5 px-4">Target Real Mailbox</th>
                  <th className="py-3.5 px-4">Purpose / Tag</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0]/60">
                {filteredAnonAliases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5f6368] text-xs">
                      No Anonmail addresses generated yet.
                    </td>
                  </tr>
                ) : (
                  filteredAnonAliases.map((anon) => (
                    <tr key={anon.id} className="hover:bg-[#f8fafd] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#202124]">
                        <div className="flex items-center gap-2">
                          <span>{anon.email}</span>
                          <button
                            onClick={() => copyToClipboard(anon.email, anon.id)}
                            className="p-1 text-[#5f6368] hover:text-[#1a73e8] rounded hover:bg-[#f1f3f4]"
                          >
                            {copiedId === anon.id ? (
                              <Check className="w-3.5 h-3.5 text-[#137333]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#5f6368]">{anon.target_user}</td>
                      <td className="py-3.5 px-4 text-[#202124]">{anon.description}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleAnonAlias(anon.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${
                            anon.enabled
                              ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                              : 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]'
                          }`}
                        >
                          {anon.enabled ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Receiving
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Blocked
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete anonymous alias ${anon.email}?`)) {
                              deleteAnonAlias(anon.id);
                            }
                          }}
                          className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Standard Alias Modal */}
      {isAddStandardOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#dadce0] overflow-hidden">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Add Forwarding Alias</h3>
              <button onClick={() => setIsAddStandardOpen(false)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStandardAlias} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] rounded-xl">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Source Alias</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="sales, support, info"
                    value={aliasLocalpart}
                    onChange={(e) => setAliasLocalpart(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                  />
                  <span className="text-[#5f6368] font-bold">@</span>
                  <select
                    value={aliasDomain}
                    onChange={(e) => setAliasDomain(e.target.value)}
                    className="px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                  >
                    {domains.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Destination Addresses (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="alex@company.com, team@company.com"
                  value={aliasDestinations}
                  onChange={(e) => setAliasDestinations(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk_wildcard"
                  checked={aliasWildcard}
                  onChange={(e) => setAliasWildcard(e.target.checked)}
                  className="rounded text-[#1a73e8]"
                />
                <label htmlFor="chk_wildcard" className="text-[#202124] font-medium cursor-pointer">
                  Catch-all wildcard alias
                </label>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound leads distribution list"
                  value={aliasComment}
                  onChange={(e) => setAliasComment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="pt-3 border-t border-[#dadce0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStandardOpen(false)}
                  className="px-4 py-2 bg-[#f1f3f4] text-[#202124] rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold shadow-xs"
                >
                  Create Alias
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Anon Alias Modal */}
      {isAddAnonOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#dadce0] overflow-hidden">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Generate Privacy Anonmail</h3>
              <button onClick={() => setIsAddAnonOpen(false)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAnonAlias} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Target Real Mailbox</label>
                <select
                  value={anonTargetUser}
                  onChange={(e) => setAnonTargetUser(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                >
                  {users.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.displayed_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Domain Suffix</label>
                <select
                  value={anonDomain}
                  onChange={(e) => setAnonDomain(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                >
                  {domains.map((d) => (
                    <option key={d.name} value={d.name}>
                      @{d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Label / Merchant Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon, Newsletter, Travel"
                  value={anonDesc}
                  onChange={(e) => setAnonDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="pt-3 border-t border-[#dadce0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnonOpen(false)}
                  className="px-4 py-2 bg-[#f1f3f4] text-[#202124] rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold shadow-xs"
                >
                  Generate Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
