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
    if (!anonTargetUser || !anonDomain) return;

    addAnonAlias(anonTargetUser, anonDomain, anonDesc.trim());
    setAnonDesc('');
    setIsAddAnonOpen(false);
  };

  const filteredStandard = aliases.filter(
    (a) =>
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.destination.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.comment && a.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAnon = anonAliases.filter(
    (a) =>
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.target_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-emerald-400" />
            Aliases & Anonymous Forwarders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Route messages from alias addresses to one or multiple destinations, or generate privacy masking addresses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'standard' ? (
            <button
              onClick={() => setIsAddStandardOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Alias
            </button>
          ) : (
            <button
              onClick={() => setIsAddAnonOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Generate Anon Alias
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('standard')}
          className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'standard'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          Standard Aliases ({aliases.length})
        </button>
        <button
          onClick={() => setActiveTab('anon')}
          className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'anon'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Anonymous Privacy Aliases (Anonmail) ({anonAliases.length})
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-500 ml-2" />
        <input
          type="text"
          placeholder="Filter aliases by email, destination, or label..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 w-full focus:outline-none"
        />
      </div>

      {/* Table Content */}
      {activeTab === 'standard' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Alias Address</th>
                  <th className="py-3 px-4">Destination(s)</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStandard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      No aliases found.
                    </td>
                  </tr>
                ) : (
                  filteredStandard.map((alias) => (
                    <tr key={alias.email} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        {alias.email}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {alias.destination.map((dest, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700/60"
                            >
                              {dest}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {alias.wildcard ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Wildcard (*@)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            Direct Alias
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {alias.comment || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete alias ${alias.email}?`)) {
                              deleteAlias(alias.email);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
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
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Privacy Alias</th>
                  <th className="py-3 px-4">Forwards To</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Activity Stats</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAnon.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No anonymous aliases created yet.
                    </td>
                  </tr>
                ) : (
                  filteredAnon.map((anon) => (
                    <tr key={anon.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 font-medium">{anon.email}</span>
                          <button
                            onClick={() => copyToClipboard(anon.email, anon.id)}
                            className="text-slate-400 hover:text-sky-400"
                            title="Copy email"
                          >
                            {copiedId === anon.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {anon.target_user}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {anon.description}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <span className="text-slate-200 font-semibold">{anon.received_count}</span> received,{' '}
                        <span className="text-emerald-400 font-semibold">{anon.forwarded_count}</span> forwarded
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleAnonAlias(anon.id)}
                          className="flex items-center gap-1 font-medium"
                        >
                          {anon.enabled ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Forwarding
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-400">
                              <XCircle className="w-3.5 h-3.5" />
                              Blocked
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Delete anonymous alias ${anon.email}?`)) {
                              deleteAnonAlias(anon.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete Anonymous Alias"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Create Standard Alias</h3>
            {formError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateStandardAlias} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Localpart</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. sales or contact"
                    value={aliasLocalpart}
                    onChange={(e) => setAliasLocalpart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Domain</label>
                  <select
                    value={aliasDomain}
                    onChange={(e) => setAliasDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  >
                    {domains.map((d) => (
                      <option key={d.name} value={d.name}>
                        @{d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Destination Addresses (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="alice@example.com, bob@example.com"
                  value={aliasDestinations}
                  onChange={(e) => setAliasDestinations(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={aliasWildcard}
                  onChange={(e) => setAliasWildcard(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600"
                />
                <span>Wildcard alias (catch all addresses under this pattern)</span>
              </label>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Comment</label>
                <input
                  type="text"
                  placeholder="e.g. Team routing"
                  value={aliasComment}
                  onChange={(e) => setAliasComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStandardOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Generate Anonymous Privacy Alias</h3>
            </div>
            <p className="text-slate-400 text-[11px]">
              VAWAY will create a random disposable forwarding address that delivers to the selected destination mailbox while masking their real identity.
            </p>
            <form onSubmit={handleCreateAnonAlias} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target User Mailbox</label>
                <select
                  value={anonTargetUser}
                  onChange={(e) => setAnonTargetUser(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                >
                  {users.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.displayed_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Domain for Alias</label>
                <select
                  value={anonDomain}
                  onChange={(e) => setAnonDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                >
                  {domains.filter((d) => d.anonmail_enabled).map((d) => (
                    <option key={d.name} value={d.name}>
                      @{d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Label / Service Note</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Shopping, Newsletter Signup"
                  value={anonDesc}
                  onChange={(e) => setAnonDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnonOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
