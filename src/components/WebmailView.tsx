import React, { useState, useEffect } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { SimulatedEmail, AnonymousAlias } from '../types';
import {
  Inbox,
  Users,
  Tag,
  Star,
  Bookmark,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Mail,
  MailOpen,
  Clock,
  AlertOctagon,
  ArrowLeft,
  Reply,
  Forward,
  Printer,
  ExternalLink,
  ShieldCheck,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Link2,
  Lock,
  PenTool,
  Send,
  X,
  Minimize2,
  Maximize2,
  CheckCircle2,
  UserCheck,
  Plus,
  Zap,
  GitFork,
  Laptop,
  Copy,
  Check,
  Download,
} from 'lucide-react';

interface WebmailViewProps {
  initialFolder?: string;
  searchTerm?: string;
  isComposeOpen?: boolean;
  composeRecipient?: string;
  onCloseCompose?: () => void;
  onOpenCompose?: (recipient?: string) => void;
}

export const WebmailView: React.FC<WebmailViewProps> = ({
  initialFolder = 'inbox',
  searchTerm = '',
  isComposeOpen = false,
  composeRecipient = '',
  onCloseCompose,
}) => {
  const {
    currentAccount,
    emails,
    users,
    domains,
    anonAliases,
    addAnonAlias,
    sendEmail,
    markEmailRead,
    toggleStarEmail,
    toggleImportantEmail,
    snoozeEmail,
    deleteEmail,
    markSpam,
  } = useVawayMail();

  const [activeTab, setActiveTab] = useState<'primary' | 'social' | 'promotions'>('primary');
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredEmailId, setHoveredEmailId] = useState<string | null>(null);
  const [localComposeOpen, setLocalComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [activeRightPanel, setActiveRightPanel] = useState<'directory' | 'dns' | 'aliases' | 'specs' | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [copiedDkim, setCopiedDkim] = useState(false);
  const [quickCreatedShield, setQuickCreatedShield] = useState<string | null>(null);

  const currentUser = users.find((u) => u.email === currentAccount) || users[0];
  const currentDomain = domains.find((d) => d.name === currentUser?.domain_name) || domains[0];

  useEffect(() => {
    if (composeRecipient) {
      setComposeTo(composeRecipient);
      setLocalComposeOpen(true);
    }
  }, [composeRecipient]);

  const composeModalOpen = isComposeOpen || localComposeOpen;
  const handleCloseComposeModal = () => {
    setLocalComposeOpen(false);
    if (onCloseCompose) onCloseCompose();
  };

  // Filter emails based on folder and active mailbox
  const currentMailboxEmails = emails.filter((m) => {
    const isTarget =
      m.to.toLowerCase() === currentAccount.toLowerCase() ||
      m.from.toLowerCase() === currentAccount.toLowerCase() ||
      (m.to.startsWith('alias@') && currentAccount.includes('alice'));

    if (!isTarget) return false;

    if (initialFolder === 'starred') return m.starred;
    if (initialFolder === 'snoozed') return m.folder === 'snoozed';
    if (initialFolder === 'sent') return m.folder === 'sent' || m.from.toLowerCase() === currentAccount.toLowerCase();
    if (initialFolder === 'drafts') return m.folder === 'drafts';
    if (initialFolder === 'priority') return m.important;
    if (initialFolder === 'spam') return m.folder === 'spam';
    if (initialFolder === 'trash') return m.folder === 'trash';

    // Inbox by default
    const isReceived = m.to.toLowerCase() === currentAccount.toLowerCase() || m.to.startsWith('alias@');
    return isReceived && (m.folder === 'inbox' || !m.folder);
  });

  // Category filter (Primary, Social, Promotions)
  const tabFilteredEmails = currentMailboxEmails.filter((m) => {
    if (initialFolder !== 'inbox' && initialFolder !== 'webmail') return true;
    if (activeTab === 'primary') return !m.category || m.category === 'primary';
    if (activeTab === 'social') return m.category === 'social';
    if (activeTab === 'promotions') return m.category === 'promotions';
    return true;
  });

  // Search filter
  const displayedEmails = tabFilteredEmails.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.subject.toLowerCase().includes(term) ||
      m.from.toLowerCase().includes(term) ||
      (m.senderName && m.senderName.toLowerCase().includes(term)) ||
      m.body.toLowerCase().includes(term)
    );
  });

  const handleSelectAll = () => {
    if (selectedIds.length === displayedEmails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedEmails.map((e) => e.id));
    }
  };

  const handleToggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteEmail(id));
    setSelectedIds([]);
  };

  const handleBulkMarkRead = (read: boolean) => {
    if (read) {
      selectedIds.forEach((id) => markEmailRead(id));
    }
    setSelectedIds([]);
  };

  const handleOpenEmail = (email: SimulatedEmail) => {
    setSelectedEmail(email);
    markEmailRead(email.id);
  };

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    sendEmail(currentAccount, composeTo, composeSubject, composeBody);

    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    handleCloseComposeModal();
  };

  const handleSendReply = () => {
    if (!selectedEmail || !replyText.trim()) return;

    sendEmail(
      currentAccount,
      selectedEmail.from,
      selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      replyText
    );

    setReplyText('');
    setShowReplyBox(false);
  };

  const handleCreateQuickShield = () => {
    const domainName = currentDomain?.name || 'example.com';
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const aliasAddress = `shield_${randomSuffix}@${domainName}`;
    const desc = `Quick Shield protection created at ${new Date().toLocaleTimeString()}`;
    addAnonAlias(currentAccount, domainName, desc);
    setQuickCreatedShield(aliasAddress);
    setTimeout(() => setQuickCreatedShield(null), 5000);
  };

  const handleDownloadMobileConfig = () => {
    const domainName = currentDomain?.name || 'example.com';
    const email = currentAccount || `user@${domainName}`;
    const xmlConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadDisplayName</key>
    <string>VAWAY Mail (${email})</string>
    <key>PayloadIdentifier</key>
    <string>vn.vaway.mail.${domainName}</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>8A1F3C4B-2B7A-4D4E-9E8D-7C6B5A4F3E2D</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>EmailAccountType</key>
            <string>EmailAccountTypeIMAP</string>
            <key>EmailAddress</key>
            <string>${email}</string>
            <key>IncomingMailServerHostName</key>
            <string>mail.${domainName}</string>
            <key>IncomingMailServerPortNumber</key>
            <integer>993</integer>
            <key>IncomingMailServerUseSSL</key>
            <true/>
            <key>OutgoingMailServerHostName</key>
            <string>mail.${domainName}</string>
            <key>OutgoingMailServerPortNumber</key>
            <integer>465</integer>
            <key>OutgoingMailServerUseSSL</key>
            <true/>
            <key>PayloadType</key>
            <string>com.apple.mail.managed</string>
        </dict>
    </array>
</dict>
</plist>`;
    const blob = new Blob([xmlConfig], { type: 'application/x-apple-aspen-config' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaway-mail-${domainName}.mobileconfig`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-white rounded-2xl border border-[#dadce0] shadow-xs overflow-hidden h-[calc(100vh-4.2rem)] select-none">
      {/* Main Mail Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Action & Toolbar Bar */}
        <div className="h-12 border-b border-[#dadce0] px-4 flex items-center justify-between text-[#5f6368] text-xs bg-white">
          {selectedEmail ? (
            /* Email View Back Button & Action Icons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-[#f1f3f4] text-[#202124] rounded-full transition-colors"
                title="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-[#dadce0] mx-1" />
              <button
                onClick={() => {
                  deleteEmail(selectedEmail.id);
                  setSelectedEmail(null);
                }}
                className="p-2 hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#d93025] rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => markEmailRead(selectedEmail.id)}
                className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors"
                title="Mark as unread"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => markSpam(selectedEmail.id, true)}
                className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors"
                title="Report spam"
              >
                <AlertOctagon className="w-4 h-4" />
              </button>
              <button
                onClick={() => snoozeEmail(selectedEmail.id)}
                className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors"
                title="Snooze"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Standard List Toolbar: Checkbox Select All, Refresh, Actions */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={displayedEmails.length > 0 && selectedIds.length === displayedEmails.length}
                  onChange={handleSelectAll}
                  className="rounded text-[#0b57d0] focus:ring-0 cursor-pointer"
                  title="Select all"
                />
                <button className="p-1 hover:bg-[#f1f3f4] rounded-sm text-[#5f6368]">
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-1 animate-in fade-in duration-100">
                  <button
                    onClick={handleBulkDelete}
                    className="p-2 hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#d93025] rounded-full"
                    title="Delete selected"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleBulkMarkRead(true)}
                    className="p-2 hover:bg-[#f1f3f4] rounded-full"
                    title="Mark as read"
                  >
                    <MailOpen className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-[#202124] ml-2">
                    {selectedIds.length} selected
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => window.location.reload()}
                    className="p-2 hover:bg-[#f1f3f4] rounded-full text-[#5f6368]"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full text-[#5f6368]" title="More">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Right Pagination Indicator */}
          <div className="flex items-center gap-3 text-xs text-[#5f6368]">
            <span>
              {displayedEmails.length > 0 ? `1–${displayedEmails.length} of ${displayedEmails.length}` : '0 of 0'}
            </span>
            <div className="flex items-center">
              <button className="p-1.5 hover:bg-[#f1f3f4] rounded-full disabled:opacity-40" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-[#f1f3f4] rounded-full disabled:opacity-40" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {selectedEmail ? (
            /* EMAIL DETAIL VIEW */
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              {/* Header Subject & Action Bar */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h1 className="text-xl font-medium text-[#202124] tracking-tight">
                    {selectedEmail.subject}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#e8eaed] text-[#444746]">
                      Inbox
                    </span>
                    {selectedEmail.labels?.map((lbl) => (
                      <span
                        key={lbl.name}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#e8f0fe] text-[#1a73e8]"
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#5f6368]">
                  <button
                    onClick={() => toggleStarEmail(selectedEmail.id)}
                    className="p-2 hover:bg-[#f1f3f4] rounded-full"
                    title={selectedEmail.starred ? 'Starred' : 'Not starred'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        selectedEmail.starred ? 'text-[#f4b400] fill-[#f4b400]' : 'text-[#5f6368]'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => toggleImportantEmail(selectedEmail.id)}
                    className="p-2 hover:bg-[#f1f3f4] rounded-full"
                    title="Important"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        selectedEmail.important ? 'text-[#f4b400] fill-[#f4b400]' : 'text-[#5f6368]'
                      }`}
                    />
                  </button>
                  <button onClick={() => window.print()} className="p-2 hover:bg-[#f1f3f4] rounded-full" title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full" title="In new window">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sender Info Row */}
              <div className="flex items-start justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-semibold text-base shrink-0 shadow-xs">
                    {(selectedEmail.senderName || selectedEmail.from).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#202124]">
                        {selectedEmail.senderName || selectedEmail.from.split('@')[0]}
                      </span>
                      <span className="text-xs text-[#5f6368] font-mono">&lt;{selectedEmail.from}&gt;</span>
                    </div>
                    <div className="text-xs text-[#5f6368] flex items-center gap-1">
                      <span>to</span>
                      <span className="font-mono text-[#202124]">{selectedEmail.to}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#5f6368] flex items-center gap-2">
                  <span>{selectedEmail.timeDisplay || selectedEmail.date}</span>
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="p-1.5 hover:bg-[#f1f3f4] rounded-full"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-[#f1f3f4] rounded-full" title="More">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Security & Authentication Bar */}
              <div className="p-3 bg-[#f8fafd] border border-[#dadce0] rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#137333]">
                  <ShieldCheck className="w-4 h-4 text-[#137333]" />
                  <span className="font-medium">VAWAY Security Verified:</span>
                  <span className="bg-[#e6f4ea] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#ceead6]">
                    SPF: {selectedEmail.spfStatus?.toUpperCase() || 'PASS'}
                  </span>
                  <span className="bg-[#e6f4ea] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#ceead6]">
                    DKIM: {selectedEmail.dkimStatus?.toUpperCase() || 'PASS'}
                  </span>
                  <span className="bg-[#e6f4ea] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#ceead6]">
                    DMARC: PASS
                  </span>
                </div>
                <div className="text-[#5f6368] text-[11px]">
                  Spam score: <span className="font-mono font-bold text-[#202124]">{selectedEmail.spamScore}</span> (Clean)
                </div>
              </div>

              {/* Email Body Content */}
              <div className="text-sm text-[#202124] whitespace-pre-line leading-relaxed font-sans pt-2 border-t border-[#f1f3f4]">
                {selectedEmail.body}
              </div>

              {/* Bottom Quick Reply Action Buttons */}
              {!showReplyBox ? (
                <div className="flex items-center gap-3 pt-6">
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="flex items-center gap-2 px-5 py-2 border border-[#dadce0] hover:bg-[#f8fafd] rounded-full text-xs font-semibold text-[#444746] transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="flex items-center gap-2 px-5 py-2 border border-[#dadce0] hover:bg-[#f8fafd] rounded-full text-xs font-semibold text-[#444746] transition-colors"
                  >
                    <Forward className="w-4 h-4" />
                    Forward
                  </button>
                </div>
              ) : (
                /* Inline Reply Form */
                <div className="mt-6 border border-[#dadce0] rounded-2xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#5f6368] border-b border-[#dadce0] pb-2">
                    <span className="flex items-center gap-1 font-medium">
                      <Reply className="w-3.5 h-3.5" />
                      Reply to {selectedEmail.from}
                    </span>
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className="p-1 hover:bg-[#f1f3f4] rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply here..."
                    className="w-full text-xs text-[#202124] placeholder-[#5f6368] focus:outline-none resize-none"
                    autoFocus
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-[#dadce0]">
                    <button
                      onClick={handleSendReply}
                      className="flex items-center gap-1.5 px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold rounded-full shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className="text-xs text-[#5f6368] hover:text-[#202124]"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EMAIL LIST VIEW */
            <div>
              {/* Category Tabs: Primary, Social, Promotions (Gmail Tab Bar) */}
              {(initialFolder === 'inbox' || initialFolder === 'webmail') && (
                <div className="flex border-b border-[#dadce0] text-xs font-medium bg-white px-2">
                  <button
                    onClick={() => setActiveTab('primary')}
                    className={`flex items-center gap-3 px-6 py-3 border-b-2 transition-colors ${
                      activeTab === 'primary'
                        ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8fafd] hover:text-[#202124]'
                    }`}
                  >
                    <Inbox className="w-4 h-4" />
                    <span>Primary</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('social')}
                    className={`flex items-center gap-3 px-6 py-3 border-b-2 transition-colors ${
                      activeTab === 'social'
                        ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8fafd] hover:text-[#202124]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Social</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('promotions')}
                    className={`flex items-center gap-3 px-6 py-3 border-b-2 transition-colors ${
                      activeTab === 'promotions'
                        ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                        : 'border-transparent text-[#5f6368] hover:bg-[#f8fafd] hover:text-[#202124]'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span>Promotions</span>
                  </button>
                </div>
              )}

              {/* Email Row Items */}
              {displayedEmails.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#5f6368] flex flex-col items-center gap-2">
                  <Inbox className="w-10 h-10 text-[#dadce0]" />
                  <p className="font-semibold text-sm text-[#202124]">No messages in this view</p>
                  <p>Your mailbox is clean and up to date.</p>
                </div>
              ) : (
                displayedEmails.map((email) => {
                  const isSelected = selectedIds.includes(email.id);
                  const isHovered = hoveredEmailId === email.id;
                  const isUnread = !email.read;

                  return (
                    <div
                      key={email.id}
                      onMouseEnter={() => setHoveredEmailId(email.id)}
                      onMouseLeave={() => setHoveredEmailId(null)}
                      onClick={() => handleOpenEmail(email)}
                      className={`flex items-center px-4 py-2 border-b border-[#f2f2f2] cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-[#c2e7ff]/30'
                          : isUnread
                          ? 'bg-white font-semibold text-[#202124]'
                          : 'bg-[#f8fafd]/60 text-[#444746] hover:bg-[#f2f6fc]'
                      }`}
                    >
                      {/* Left: Checkbox, Star, Important */}
                      <div className="flex items-center gap-3 shrink-0 mr-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(e as any, email.id)}
                          className="rounded text-[#0b57d0] focus:ring-0 cursor-pointer"
                        />
                        <button
                          onClick={() => toggleStarEmail(email.id)}
                          className="text-[#5f6368] hover:text-[#f4b400] transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              email.starred ? 'text-[#f4b400] fill-[#f4b400]' : 'text-[#dadce0]'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => toggleImportantEmail(email.id)}
                          className="text-[#5f6368] hover:text-[#f4b400] transition-colors hidden sm:inline"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              email.important ? 'text-[#f4b400] fill-[#f4b400]' : 'text-[#dadce0]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Sender Name */}
                      <div className="w-44 shrink-0 truncate pr-2">
                        <span className={`text-xs ${isUnread ? 'text-[#202124] font-bold' : 'text-[#202124]'}`}>
                          {email.senderName || email.from}
                        </span>
                      </div>

                      {/* Subject + Snippet + Labels */}
                      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden pr-4">
                        {email.labels && email.labels.length > 0 && (
                          <span className="bg-[#e8eaed] text-[#444746] text-[10px] font-medium px-1.5 py-0.2 rounded-xs shrink-0">
                            {email.labels[0].name}
                          </span>
                        )}
                        <span className={`truncate text-xs ${isUnread ? 'text-[#202124] font-bold' : 'text-[#202124]'}`}>
                          {email.subject}
                        </span>
                        <span className="text-[#5f6368] text-xs font-normal truncate hidden sm:inline">
                          — {email.body.replace(/\n/g, ' ')}
                        </span>
                      </div>

                      {/* Right: Date or Hover Action Icons */}
                      <div className="shrink-0 text-right min-w-[90px]">
                        {isHovered ? (
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                deleteEmail(email.id);
                              }}
                              className="p-1.5 hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#d93025] rounded-full"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => markEmailRead(email.id)}
                              className="p-1.5 hover:bg-[#e8eaed] text-[#5f6368] rounded-full"
                              title={email.read ? 'Mark as unread' : 'Mark as read'}
                            >
                              {email.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => snoozeEmail(email.id)}
                              className="p-1.5 hover:bg-[#e8eaed] text-[#5f6368] rounded-full"
                              title="Snooze"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[11px] ${isUnread ? 'text-[#202124] font-bold' : 'text-[#5f6368]'}`}>
                            {email.timeDisplay || email.date}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Companion Bar (VAWAY Mail Suite: Directory, DNS, Aliases, Specs) */}
      <div className="w-14 border-l border-[#dadce0]/80 bg-[#f6f8fc] flex flex-col items-center py-3 gap-4 shrink-0 select-none">
        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'directory' ? null : 'directory')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'directory' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="Company Contacts & Mailboxes"
        >
          <UserCheck className="w-5 h-5 text-[#0b57d0]" />
        </button>

        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'dns' ? null : 'dns')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'dns' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="DNS & Deliverability Records"
        >
          <Zap className="w-5 h-5 text-[#f29900]" />
        </button>

        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'aliases' ? null : 'aliases')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'aliases' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="Aliases & Privacy Shields"
        >
          <GitFork className="w-5 h-5 text-[#137333]" />
        </button>

        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'specs' ? null : 'specs')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'specs' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="Server Ports & Client Config"
        >
          <Laptop className="w-5 h-5 text-[#7c3aed]" />
        </button>

        <div className="w-6 h-px bg-[#dadce0] my-1" />

        <button
          onClick={handleCreateQuickShield}
          className="p-2 text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#0b57d0] rounded-full transition-colors"
          title="Quick Generate Shield Alias"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Companion Bar Slide-out Panel */}
      {activeRightPanel && (
        <div className="w-80 border-l border-[#dadce0] bg-white p-4 flex flex-col overflow-y-auto text-xs shadow-lg animate-in slide-in-from-right duration-150 select-none">
          <div className="flex items-center justify-between pb-3 border-b border-[#dadce0]">
            <h3 className="font-bold text-sm text-[#202124] flex items-center gap-2">
              {activeRightPanel === 'directory' && <UserCheck className="w-4 h-4 text-[#0b57d0]" />}
              {activeRightPanel === 'dns' && <Zap className="w-4 h-4 text-[#f29900]" />}
              {activeRightPanel === 'aliases' && <GitFork className="w-4 h-4 text-[#137333]" />}
              {activeRightPanel === 'specs' && <Laptop className="w-4 h-4 text-[#7c3aed]" />}
              {activeRightPanel === 'directory' && 'Company Directory'}
              {activeRightPanel === 'dns' && 'DNS & Deliverability'}
              {activeRightPanel === 'aliases' && 'Shield Aliases'}
              {activeRightPanel === 'specs' && 'Client Ports & Setup'}
            </h3>
            <button onClick={() => setActiveRightPanel(null)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-3 flex-1 overflow-y-auto">
            {/* Panel 1: Company Directory */}
            {activeRightPanel === 'directory' && (
              <div className="space-y-2">
                <p className="text-[11px] text-[#5f6368]">
                  Click on any colleague to immediately compose and send an email:
                </p>
                <div className="space-y-1 mt-2">
                  {users.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => {
                        setComposeTo(u.email);
                        setLocalComposeOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#f1f3f4] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <div className="w-7 h-7 rounded-full bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center font-bold text-xs">
                            {u.displayed_name.charAt(0)}
                          </div>
                          {u.enabled && (
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#137333] ring-1 ring-white" />
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-[#202124] group-hover:text-[#0b57d0] truncate text-xs">
                            {u.displayed_name}
                          </div>
                          <div className="text-[10px] text-[#5f6368] font-mono truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                      <Mail className="w-4 h-4 text-[#5f6368] group-hover:text-[#0b57d0] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 2: DNS & Deliverability */}
            {activeRightPanel === 'dns' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#202124]">Domain:</span>
                    <span className="font-mono text-[#0b57d0] font-bold">@{currentDomain?.name}</span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5f6368]">MX Record:</span>
                      <span className="text-[#137333] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Configured
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5f6368]">SPF Record:</span>
                      <span className="text-[#137333] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5f6368]">DKIM Signing:</span>
                      <span className="text-[#137333] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 2048-bit Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5f6368]">DMARC Policy:</span>
                      <span className="text-[#137333] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> p=quarantine
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#e8f0fe] rounded-xl border border-[#d2e3fc] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0b57d0] text-xs">SPF String:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`v=spf1 mx a:${currentDomain?.name} ~all`);
                        setCopiedDkim(true);
                        setTimeout(() => setCopiedDkim(false), 2000);
                      }}
                      className="text-[10px] text-[#0b57d0] hover:underline flex items-center gap-0.5"
                    >
                      {copiedDkim ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedDkim ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-[#202124] break-all bg-white p-2 rounded-lg border border-[#d2e3fc]">
                    v=spf1 mx a:{currentDomain?.name} ~all
                  </div>
                </div>
              </div>
            )}

            {/* Panel 3: Shield Aliases */}
            {activeRightPanel === 'aliases' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#5f6368]">Active aliases for {currentAccount}:</span>
                  <button
                    onClick={handleCreateQuickShield}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-[10px] font-semibold shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    New Shield
                  </button>
                </div>

                {quickCreatedShield && (
                  <div className="p-2.5 bg-[#e6f4ea] border border-[#ceead6] rounded-xl text-[11px] text-[#137333] flex items-center justify-between">
                    <span className="font-mono truncate">{quickCreatedShield}</span>
                    <span className="text-[10px] font-bold">Created!</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  {anonAliases
                    .filter((a: AnonymousAlias) => a.target_user.toLowerCase() === currentAccount.toLowerCase())
                    .map((a: AnonymousAlias) => (
                      <div key={a.id} className="p-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl">
                        <div className="font-mono text-[#202124] font-semibold truncate text-[11px]">{a.email}</div>
                        <div className="text-[10px] text-[#5f6368] mt-0.5">{a.description}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Panel 4: Client Ports & Setup */}
            {activeRightPanel === 'specs' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-2">
                  <div className="font-semibold text-[#202124]">Connection Specifications</div>
                  <div className="space-y-1.5 font-mono text-[10px] text-[#444746]">
                    <div className="flex justify-between bg-white p-1.5 rounded border border-[#dadce0]/60">
                      <span>IMAP Host:</span>
                      <span className="text-[#202124] font-bold">mail.{currentDomain?.name}:993 (SSL)</span>
                    </div>
                    <div className="flex justify-between bg-white p-1.5 rounded border border-[#dadce0]/60">
                      <span>SMTP Host:</span>
                      <span className="text-[#202124] font-bold">mail.{currentDomain?.name}:465 (SSL)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadMobileConfig}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download iOS / Mac Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Compose Window */}
      {composeModalOpen && (
        <div className="fixed bottom-0 right-16 z-50 w-full max-w-lg bg-white rounded-t-2xl shadow-2xl border border-[#dadce0] flex flex-col overflow-hidden text-xs select-none animate-in slide-in-from-bottom-5 duration-150">
          {/* Header */}
          <div className="bg-[#f2f6fc] px-4 py-2.5 flex items-center justify-between border-b border-[#dadce0]">
            <span className="font-semibold text-[#202124] text-xs">New Message</span>
            <div className="flex items-center gap-1 text-[#5f6368]">
              <button className="p-1 hover:bg-[#dadce0] rounded-sm">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:bg-[#dadce0] rounded-sm">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleCloseComposeModal} className="p-1 hover:bg-[#dadce0] rounded-sm">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSendCompose} className="flex flex-col flex-1">
            <div className="px-4 py-2 border-b border-[#f2f2f2] flex items-center gap-2">
              <span className="text-[#5f6368] w-12">From:</span>
              <span className="font-mono text-[#202124]">{currentAccount}</span>
            </div>

            <div className="px-4 py-2 border-b border-[#f2f2f2] flex items-center gap-2">
              <span className="text-[#5f6368] w-12">Recipients:</span>
              <input
                type="email"
                required
                placeholder="colleague@domain.com"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="flex-1 text-[#202124] font-mono focus:outline-none"
                autoFocus
              />
            </div>

            <div className="px-4 py-2 border-b border-[#f2f2f2]">
              <input
                type="text"
                required
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="w-full text-[#202124] font-medium focus:outline-none"
              />
            </div>

            <div className="p-4 flex-1">
              <textarea
                rows={8}
                required
                placeholder="Type your email message..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full text-sm text-[#202124] placeholder-[#5f6368] focus:outline-none resize-none"
              />
            </div>

            {/* Bottom Formatting & Send Toolbar */}
            <div className="px-4 py-3 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold rounded-full shadow-xs transition-colors"
                >
                  <span>Send</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                <div className="flex items-center gap-1 text-[#5f6368]">
                  <button type="button" className="p-1.5 hover:bg-[#e8eaed] rounded-full" title="Formatting options">
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-[#e8eaed] rounded-full" title="Attach files">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-[#e8eaed] rounded-full" title="Insert link">
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-[#e8eaed] rounded-full" title="Insert emoji">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-[#e8eaed] rounded-full" title="Insert photo">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-[#e8eaed] rounded-full" title="Confidential mode">
                    <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseComposeModal}
                className="p-2 text-[#5f6368] hover:bg-[#e8eaed] hover:text-[#d93025] rounded-full transition-colors"
                title="Discard draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
