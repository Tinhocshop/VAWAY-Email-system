import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { KeyRound, Plus, Trash2, Copy, Check, X } from 'lucide-react';

export const TokensView: React.FC = () => {
  const { tokens, addToken, deleteToken, users } = useVawayMail();
  const [isOpen, setIsOpen] = useState(false);
  const [rawTokenCreated, setRawTokenCreated] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedUser, setSelectedUser] = useState(users[0]?.email || '');
  const [comment, setComment] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(90);

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const raw = addToken(selectedUser, comment.trim(), expiresInDays);
    setRawTokenCreated(raw);
    setComment('');
    setIsOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-5 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#1a73e8]" />
            API Authentication Tokens
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Generate and manage scoped API bearer tokens for VAWAY REST API endpoints (<span className="font-mono font-semibold text-[#202124]">/api/v1/</span>).
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Generate API Token
        </button>
      </div>

      {/* Raw token reveal modal */}
      {rawTokenCreated && (
        <div className="p-5 bg-[#e6f4ea] border border-[#ceead6] rounded-2xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#137333]">New Bearer Token Generated</span>
            <button onClick={() => setRawTokenCreated(null)} className="text-[#5f6368] hover:text-[#202124]">
              Dismiss
            </button>
          </div>
          <p className="text-[#137333]">
            Please copy this secret token immediately. It will not be shown again!
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2.5 bg-white font-mono text-[#137333] rounded-xl border border-[#ceead6] select-all overflow-x-auto text-xs">
              {rawTokenCreated}
            </div>
            <button
              onClick={() => copyToClipboard(rawTokenCreated)}
              className="px-4 py-2.5 bg-[#188038] hover:bg-[#137333] text-white rounded-full font-semibold flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Tokens Table */}
      <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8fafd] border-b border-[#dadce0] text-[#5f6368] font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Token Identifier</th>
              <th className="py-3.5 px-4">Associated User</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4">Expires At</th>
              <th className="py-3.5 px-4">Label / Comment</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]/60">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#5f6368] text-xs">
                  No API tokens generated yet.
                </td>
              </tr>
            ) : (
              tokens.map((tok) => (
                <tr key={tok.id} className="hover:bg-[#f8fafd] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1a73e8]">{tok.id}</td>
                  <td className="py-3.5 px-4 font-mono text-[#202124]">{tok.user_email}</td>
                  <td className="py-3.5 px-4 text-[#5f6368]">
                    {new Date(tok.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#5f6368]">
                    {tok.expires_at ? new Date(tok.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3.5 px-4 text-[#202124]">{tok.comment || '—'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Revoke token ${tok.id}?`)) {
                          deleteToken(tok.id);
                        }
                      }}
                      className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-red-50 rounded-full transition-colors"
                      title="Revoke Token"
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

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#dadce0] overflow-hidden">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Create Bearer Token</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateToken} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Target Account</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                >
                  {users.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.displayed_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Expiration Period</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>1 Year</option>
                  <option value={0}>Never Expires</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Label / Application Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zapier Integration / Backup Script"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="pt-3 border-t border-[#dadce0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-[#f1f3f4] text-[#202124] rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold shadow-xs"
                >
                  Create Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
