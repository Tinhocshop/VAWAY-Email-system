import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { EmailMessage } from '../types';
import {
  Mail,
  Send,
  Inbox,
  Trash2,
  ShieldAlert,
  Search,
  PenSquare,
  CheckCircle2,
  Reply,
  ArrowLeft,
  X,
} from 'lucide-react';

export const WebmailView: React.FC = () => {
  const { currentAccount, emails, sendEmail, markEmailRead, deleteEmail, markSpam } = useVawayMail();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'spam' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Compose state
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');

  const accountEmails = emails.filter((m) => {
    if (activeFolder === 'sent') {
      return m.from.toLowerCase() === currentAccount.toLowerCase() && m.folder === 'sent';
    }
    if (activeFolder === 'spam') {
      return m.to.toLowerCase() === currentAccount.toLowerCase() && m.folder === 'spam';
    }
    if (activeFolder === 'trash') {
      return (m.to.toLowerCase() === currentAccount.toLowerCase() || m.from.toLowerCase() === currentAccount.toLowerCase()) && m.folder === 'trash';
    }
    // Inbox
    return m.to.toLowerCase() === currentAccount.toLowerCase() && (m.folder === 'inbox' || !m.folder);
  });

  const filteredEmails = accountEmails.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEmail = (msg: EmailMessage) => {
    setSelectedEmail(msg);
    if (!msg.read) {
      markEmailRead(msg.id);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) return;

    sendEmail(currentAccount, to.trim(), subject.trim(), body.trim());
    setTo('');
    setSubject('');
    setBody('');
    setIsComposeOpen(false);
    setSendSuccessMsg('Message dispatched via Postfix SMTP.');
    setTimeout(() => setSendSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            VAWAY Webmail Client
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Mailbox: <span className="font-mono text-sky-300 font-semibold">{currentAccount}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sendSuccessMsg && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {sendSuccessMsg}
            </span>
          )}
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <PenSquare className="w-4 h-4" />
            Compose
          </button>
        </div>
      </div>

      {/* Main Mail Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex overflow-hidden shadow-xl">
        {/* Folders Sidebar */}
        <div className="w-44 bg-slate-950/50 border-r border-slate-800 p-2 flex flex-col gap-1 shrink-0 text-xs">
          <button
            onClick={() => {
              setActiveFolder('inbox');
              setSelectedEmail(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeFolder === 'inbox' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            <span className="text-[10px] opacity-80">
              {emails.filter((m) => m.to.toLowerCase() === currentAccount.toLowerCase() && (m.folder === 'inbox' || !m.folder) && !m.read).length || ''}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('sent');
              setSelectedEmail(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeFolder === 'sent' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Sent</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveFolder('spam');
              setSelectedEmail(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeFolder === 'spam' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Junk / Spam</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveFolder('trash');
              setSelectedEmail(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
              activeFolder === 'trash' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </div>
          </button>
        </div>

        {/* Email list or details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* List panel */}
          <div
            className={`w-full md:w-80 border-r border-slate-800 flex flex-col shrink-0 ${
              selectedEmail ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search */}
            <div className="p-2 border-b border-slate-800">
              <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-slate-200 placeholder-slate-500 w-full focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {filteredEmails.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No messages in {activeFolder}.
                </div>
              ) : (
                filteredEmails.map((msg) => {
                  const isSelected = selectedEmail?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectEmail(msg)}
                      className={`p-3 cursor-pointer transition-colors text-xs ${
                        isSelected
                          ? 'bg-sky-500/10 border-l-2 border-sky-500'
                          : msg.read
                          ? 'hover:bg-slate-800/40 text-slate-400'
                          : 'bg-slate-800/30 hover:bg-slate-800/60 text-slate-200 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                        <span className="truncate font-mono text-slate-300">
                          {activeFolder === 'sent' ? `To: ${msg.to}` : msg.from}
                        </span>
                        <span className="text-slate-500 shrink-0 text-[10px]">{msg.date}</span>
                      </div>
                      <div className="font-medium text-slate-200 truncate">{msg.subject}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                        {msg.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reading pane */}
          <div className={`flex-1 flex flex-col bg-slate-950/30 overflow-hidden ${!selectedEmail ? 'hidden md:flex' : 'flex'}`}>
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-y-auto p-5">
                {/* Back button on mobile */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white md:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to list
                  </button>

                  <div className="flex items-center gap-2 text-xs ml-auto">
                    <button
                      onClick={() => {
                        setTo(selectedEmail.from);
                        setSubject(`Re: ${selectedEmail.subject}`);
                        setBody(`\n\n--- Original Message ---\n${selectedEmail.body}`);
                        setIsComposeOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply
                    </button>
                    {activeFolder !== 'spam' ? (
                      <button
                        onClick={() => markSpam(selectedEmail.id, true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 rounded text-xs transition-colors"
                        title="Train Rspamd as spam"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Mark Spam
                      </button>
                    ) : (
                      <button
                        onClick={() => markSpam(selectedEmail.id, false)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 rounded text-xs transition-colors"
                        title="Train Rspamd as Ham"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Not Spam
                      </button>
                    )}
                    <button
                      onClick={() => {
                        deleteEmail(selectedEmail.id);
                        setSelectedEmail(null);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded transition-colors"
                      title="Delete email"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email headers */}
                <div className="space-y-3 pb-4 border-b border-slate-800 text-xs">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {selectedEmail.subject}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                    <div>
                      <span className="font-semibold text-slate-300">From: </span>
                      <span className="font-mono text-slate-200">{selectedEmail.from}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">To: </span>
                      <span className="font-mono text-slate-200">{selectedEmail.to}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">Date: </span>
                      <span className="text-slate-200">{selectedEmail.date}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">Security: </span>
                      <span className="text-emerald-400 font-mono font-medium">
                        SPF: PASS • DKIM: PASS (VAWAY MTA)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="py-5 text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedEmail.body}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-6">
                <Mail className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <p>Select a message to view its contents and cryptographic headers.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PenSquare className="w-4 h-4 text-sky-400" />
                New Message
              </h3>
              <button onClick={() => setIsComposeOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">From</label>
                <input
                  type="text"
                  disabled
                  value={currentAccount}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">To</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com (try alice@example.com or support@example.com)"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Body</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Type your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
