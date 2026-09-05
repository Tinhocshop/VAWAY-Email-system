import React, { useState } from 'react';
import { User, Domain } from '../types';
import { useVawayMail } from '../context/VawayMailContext';
import {
  X,
  Mail,
  Plane,
  Forward,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

interface UserModalProps {
  userToEdit?: User | null;
  domains: Domain[];
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ userToEdit, domains, onClose }) => {
  const { addUser, updateUser } = useVawayMail();
  const isEditing = !!userToEdit;

  const [activeTab, setActiveTab] = useState<'general' | 'autoreply' | 'forwarding' | 'spam'>('general');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [localpart, setLocalpart] = useState(userToEdit?.localpart || '');
  const [domainName, setDomainName] = useState(userToEdit?.domain_name || domains[0]?.name || '');
  const [displayedName, setDisplayedName] = useState(userToEdit?.displayed_name || '');
  const [password, setPassword] = useState('');
  const [quotaGb, setQuotaGb] = useState(
    userToEdit ? (userToEdit.quota_bytes / (1024 * 1024 * 1024)).toFixed(0) : '2'
  );
  const [enabled, setEnabled] = useState(userToEdit ? userToEdit.enabled : true);
  const [enableImap, setEnableImap] = useState(userToEdit ? userToEdit.enable_imap : true);
  const [enablePop, setEnablePop] = useState(userToEdit ? userToEdit.enable_pop : true);
  const [globalAdmin, setGlobalAdmin] = useState(userToEdit ? userToEdit.global_admin : false);
  const [comment, setComment] = useState(userToEdit?.comment || '');

  // Auto reply
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(userToEdit?.auto_reply_enabled || false);
  const [autoReplySubject, setAutoReplySubject] = useState(userToEdit?.auto_reply_subject || '');
  const [autoReplyBody, setAutoReplyBody] = useState(userToEdit?.auto_reply_body || '');
  const [autoReplyStart, setAutoReplyStart] = useState(userToEdit?.auto_reply_start || '');
  const [autoReplyEnd, setAutoReplyEnd] = useState(userToEdit?.auto_reply_end || '');

  // Forwarding
  const [forwardEnabled, setForwardEnabled] = useState(userToEdit?.forward_enabled || false);
  const [forwardDestinations, setForwardDestinations] = useState(
    userToEdit ? userToEdit.forward_destination.join(', ') : ''
  );
  const [forwardKeep, setForwardKeep] = useState(userToEdit ? userToEdit.forward_keep : true);

  // Spam
  const [spamEnabled, setSpamEnabled] = useState(userToEdit ? userToEdit.spam_enabled : true);
  const [spamThreshold, setSpamThreshold] = useState(userToEdit ? userToEdit.spam_threshold : 80);
  const [spamMarkAsRead, setSpamMarkAsRead] = useState(userToEdit ? userToEdit.spam_mark_as_read : false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const quotaBytes = parseFloat(quotaGb) * 1024 * 1024 * 1024;
    const destinations = forwardDestinations
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    if (isEditing && userToEdit) {
      updateUser(userToEdit.email, {
        displayed_name: displayedName,
        quota_bytes: quotaBytes,
        enabled,
        enable_imap: enableImap,
        enable_pop: enablePop,
        global_admin: globalAdmin,
        comment,
        auto_reply_enabled: autoReplyEnabled,
        auto_reply_subject: autoReplySubject,
        auto_reply_body: autoReplyBody,
        auto_reply_start: autoReplyStart,
        auto_reply_end: autoReplyEnd,
        forward_enabled: forwardEnabled,
        forward_destination: destinations,
        forward_keep: forwardKeep,
        spam_enabled: spamEnabled,
        spam_threshold: Number(spamThreshold),
        spam_mark_as_read: spamMarkAsRead,
      });
      onClose();
    } else {
      if (!localpart.trim() || !domainName) {
        setErrorMessage('Localpart and domain are required.');
        return;
      }
      const fullEmail = `${localpart.trim().toLowerCase()}@${domainName.toLowerCase()}`;
      const success = addUser({
        email: fullEmail,
        localpart: localpart.trim().toLowerCase(),
        domain_name: domainName.toLowerCase(),
        displayed_name: displayedName || localpart.trim(),
        quota_bytes: quotaBytes,
        enabled,
        enable_imap: enableImap,
        enable_pop: enablePop,
        global_admin: globalAdmin,
        comment,
        auto_reply_enabled: autoReplyEnabled,
        auto_reply_subject: autoReplySubject,
        auto_reply_body: autoReplyBody,
        auto_reply_start: autoReplyStart,
        auto_reply_end: autoReplyEnd,
        forward_enabled: forwardEnabled,
        forward_destination: destinations,
        forward_keep: forwardKeep,
        spam_enabled: spamEnabled,
        spam_threshold: Number(spamThreshold),
        spam_mark_as_read: spamMarkAsRead,
      });

      if (!success) {
        setErrorMessage(`User with email ${fullEmail} already exists.`);
        return;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Edit Mailbox: ${userToEdit?.email}` : 'Create New Mailbox'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure account credentials, storage limits, auto-reply, and forwarding rules.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-5 gap-3 text-xs font-medium bg-slate-950/30">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'general' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            General & Quota
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('autoreply')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'autoreply' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            Auto-Reply (Vacation)
            {autoReplyEnabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forwarding')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'forwarding' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Forward className="w-3.5 h-3.5" />
            Forwarding
            {forwardEnabled && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spam')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'spam' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Antispam
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
              {errorMessage}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Address */}
              {!isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Localpart</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. john"
                      value={localpart}
                      onChange={(e) => setLocalpart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Domain</label>
                    <select
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      {domains.map((d) => (
                        <option key={d.name} value={d.name}>
                          @{d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={userToEdit.email}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 font-mono"
                  />
                </div>
              )}

              {/* Display name & password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Displayed Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={displayedName}
                    onChange={(e) => setDisplayedName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isEditing ? 'New Password (leave blank to keep)' : 'Initial Password'}
                  </label>
                  <input
                    type="password"
                    placeholder={isEditing ? '••••••••' : 'Enter secure password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Quota */}
              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>Mailbox Quota (GB)</span>
                  <span className="text-slate-400 font-normal">0 = unlimited</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={quotaGb}
                  onChange={(e) => setQuotaGb(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Protocol toggles */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-2">
                <span className="block font-medium text-slate-200 mb-1">Access & Protocol Permissions</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-sky-600"
                    />
                    <span>Account Active</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableImap}
                      onChange={(e) => setEnableImap(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-sky-600"
                    />
                    <span>Enable IMAP</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePop}
                      onChange={(e) => setEnablePop(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-sky-600"
                    />
                    <span>Enable POP3</span>
                  </label>
                </div>
              </div>

              {/* Admin Privileges */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalAdmin}
                  onChange={(e) => setGlobalAdmin(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <span className="font-semibold block">Grant Global Administrator Access</span>
                  <span className="text-[11px] text-amber-400/80 block">
                    Allows user full administrative access to all domains, relays, and server configurations in VAWAY Mail Server.
                  </span>
                </div>
              </label>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Comment / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Finance department head"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'autoreply' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-slate-200 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600"
                />
                <span>Enable Automatic Out-of-Office / Vacation Responder</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={autoReplyStart}
                    onChange={(e) => setAutoReplyStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={autoReplyEnd}
                    onChange={(e) => setAutoReplyEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Auto-Reply Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Out of Office: On Vacation"
                  value={autoReplySubject}
                  onChange={(e) => setAutoReplySubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Auto-Reply Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Hello, I am currently out of office and will respond upon my return..."
                  value={autoReplyBody}
                  onChange={(e) => setAutoReplyBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>
            </div>
          )}

          {activeTab === 'forwarding' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-slate-200 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={forwardEnabled}
                  onChange={(e) => setForwardEnabled(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600"
                />
                <span>Enable Inbound Email Forwarding</span>
              </label>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Forward Destination Addresses (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. backup@external.com, colleague@example.com"
                  value={forwardDestinations}
                  onChange={(e) => setForwardDestinations(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forwardKeep}
                  onChange={(e) => setForwardKeep(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600"
                />
                <span>Keep a copy in this VAWAY mailbox when forwarding</span>
              </label>
            </div>
          )}

          {activeTab === 'spam' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-slate-200 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={spamEnabled}
                  onChange={(e) => setSpamEnabled(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600"
                />
                <span>Enable Rspamd Heuristic Spam Filtering for this account</span>
              </label>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>Spam Sensitivity Threshold ({spamThreshold})</span>
                  <span className="text-slate-400">Default: 80</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={spamThreshold}
                  onChange={(e) => setSpamThreshold(parseInt(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={spamMarkAsRead}
                  onChange={(e) => setSpamMarkAsRead(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600"
                />
                <span>Automatically mark detected spam as read in the Junk folder</span>
              </label>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold"
            >
              {isEditing ? 'Save Changes' : 'Create Mailbox'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
