import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { KeyRound, Plus, Trash2, Copy, Check, Code2 } from 'lucide-react';

export const TokensView: React.FC = () => {
  const { tokens, addToken, deleteToken, users, config } = useVawayMail();
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-sky-400" />
            API Authentication Tokens
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and manage scoped API bearer tokens for VAWAY REST API endpoints (<span className="font-mono text-slate-300">/api/v1/</span>).
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Generate API Token
        </button>
      </div>

      {/* Raw token reveal modal */}
      {rawTokenCreated && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300">New Bearer Token Generated</span>
            <button
              onClick={() => setRawTokenCreated(null)}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <p className="text-slate-300">
            Please copy this secret token immediately. You will not be able to see it again!
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2 bg-slate-950 font-mono text-emerald-400 rounded border border-emerald-500/20 select-all overflow-x-auto">
              {rawTokenCreated}
            </div>
            <button
              onClick={() => copyToClipboard(rawTokenCreated)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center gap-1 shrink-0"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Tokens Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Token Identifier</th>
              <th className="py-3 px-4">Associated User</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4">Expires At</th>
              <th className="py-3 px-4">Label / Comment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                  No API tokens generated yet.
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <tr key={token.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    <span className="text-sky-400">{token.id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {token.user_email}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {token.created_at}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {token.expires_at}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {token.comment || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Revoke API token ${token.id}?`)) {
                          deleteToken(token.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
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

      {/* API Usage Examples */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Code2 className="w-4 h-4 text-sky-400" />
          <span>API Curl Example</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto">
          {`curl -X GET https://${config.hostname}/api/v1/domain \\
  -H "Authorization: Bearer <YOUR_API_TOKEN>" \\
  -H "Content-Type: application/json"`}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Generate API Token</h3>
            <form onSubmit={handleCreateToken} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Account</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
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
                <label className="block text-slate-300 font-medium mb-1">Validity (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Comment / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. CI/CD automation or SimpleLogin sync"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
