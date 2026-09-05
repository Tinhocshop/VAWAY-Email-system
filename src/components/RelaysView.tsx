import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { ArrowRightLeft, Plus, Trash2, Server, HelpCircle, X } from 'lucide-react';

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
    <div className="space-y-5 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#1a73e8]" />
            Relayed Mail Domains
          </h1>
          <p className="text-xs text-[#5f6368] mt-1">
            Domains whose incoming messages should be accepted by VAWAY and relayed forward to a designated downstream SMTP host.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-semibold transition-colors self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Relayed Domain
        </button>
      </div>

      <div className="p-4 bg-[#e8f0fe] border border-[#d2e3fc] rounded-2xl flex items-start gap-3 text-xs text-[#1a73e8]">
        <HelpCircle className="w-4 h-4 text-[#1a73e8] shrink-0 mt-0.5" />
        <div>
          VAWAY acts as a secondary MX or perimeter spam filter for relayed domains. All incoming emails for these domains pass anti-spam and antivirus checks before forwarding.
        </div>
      </div>

      <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8fafd] border-b border-[#dadce0] text-[#5f6368] font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Domain Name</th>
              <th className="py-3.5 px-4">Target Downstream SMTP Server</th>
              <th className="py-3.5 px-4">Comment</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]/60">
            {relays.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#5f6368] text-xs">
                  No relayed domains configured.
                </td>
              </tr>
            ) : (
              relays.map((relay) => (
                <tr key={relay.name} className="hover:bg-[#f8fafd] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#202124]">{relay.name}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[#202124]">
                      <Server className="w-3.5 h-3.5 text-[#1a73e8]" />
                      {relay.smtp}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#5f6368] text-[11px]">{relay.comment || '—'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Remove relayed domain ${relay.name}?`)) {
                          deleteRelay(relay.name);
                        }
                      }}
                      className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-red-50 rounded-full transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#dadce0] overflow-hidden">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202124]">Add Relayed Domain</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. internal.company.com"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Downstream SMTP Host:Port</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. smtp.internal.lan:25"
                  value={smtp}
                  onChange={(e) => setSmtp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Comment</label>
                <input
                  type="text"
                  placeholder="e.g. On-premise Exchange server relay"
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
                  Create Relay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
