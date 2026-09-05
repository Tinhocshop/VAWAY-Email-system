import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { ArrowRightLeft, Plus, Trash2, Server, HelpCircle } from 'lucide-react';

export const RelaysView: React.FC = () => {
  const { relays, addRelay, deleteRelay } = useVawayMail();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [smtp, setSmtp] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !smtp.trim()) return;
    addRelay(name.trim(), smtp.trim(), comment.trim());
    setName('');
    setSmtp('');
    setComment('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-sky-400" />
            Relayed Mail Domains
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Domains whose incoming messages should be accepted by VAWAY and relayed forward to a designated downstream SMTP host.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Relayed Domain
        </button>
      </div>

      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          VAWAY acts as a secondary MX or mail filter for relayed domains. All emails for these domains will pass spam and antivirus filtering before being handed over to your internal SMTP server.
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Domain Name</th>
              <th className="py-3 px-4">Target Downstream SMTP Server</th>
              <th className="py-3 px-4">Comment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {relays.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                  No relayed domains configured.
                </td>
              </tr>
            ) : (
              relays.map((relay) => (
                <tr key={relay.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    {relay.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-slate-300">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      {relay.smtp}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {relay.comment || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remove relayed domain ${relay.name}?`)) {
                          deleteRelay(relay.name);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      title="Remove Relay"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Add Relayed Domain</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. branch.company.com"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Target SMTP Host & Port
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. smtp-in.branch.internal:25"
                  value={smtp}
                  onChange={(e) => setSmtp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Comment</label>
                <input
                  type="text"
                  placeholder="e.g. Secondary mail host"
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
                  Save Relay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
