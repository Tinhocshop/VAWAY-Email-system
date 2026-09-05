import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { SimulatedEmail } from '../types';
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
  CheckSquare,
  Square,
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
  Calendar,
  Lightbulb,
  CheckCircle2,
  UserCheck,
  Plus,
} from 'lucide-react';

interface WebmailViewProps {
  initialFolder?: string;
  searchTerm?: string;
  isComposeOpen?: boolean;
  onCloseCompose?: () => void;
  onOpenCompose?: () => void;
}

export const WebmailView: React.FC<WebmailViewProps> = ({
  initialFolder = 'inbox',
  searchTerm = '',
  isComposeOpen = false,
  onCloseCompose,
  onOpenCompose,
}) => {
  const {
    currentAccount,
    emails,
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
  const [activeRightPanel, setActiveRightPanel] = useState<'calendar' | 'keep' | 'tasks' | 'contacts' | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  const composeModalOpen = isComposeOpen || localComposeOpen;
  const handleCloseComposeModal = () => {
    setLocalComposeOpen(false);
    if (onCloseCompose) onCloseCompose();
  };

  // Filter emails based on folder and active mailbox
  const currentMailboxEmails = emails.filter((m) => {
    const isSent = m.from.toLowerCase() === currentAccount.toLowerCase() && m.folder === 'sent';
    const isReceived = m.to.toLowerCase() === currentAccount.toLowerCase();

    if (initialFolder === 'sent') return isSent;
    if (initialFolder === 'starred') return m.starred;
    if (initialFolder === 'snoozed') return m.folder === 'snoozed';
    if (initialFolder === 'drafts') return m.folder === 'drafts';
    if (initialFolder === 'priority') return m.important || m.starred;
    if (initialFolder === 'spam') return isReceived && m.folder === 'spam';
    if (initialFolder === 'trash') return m.folder === 'trash';

    // Default Inbox
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

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleOpenEmail = (email: SimulatedEmail) => {
    setSelectedEmail(email);
    if (!email.read) {
      markEmailRead(email.id);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteEmail(id));
    setSelectedIds([]);
    if (selectedEmail && selectedIds.includes(selectedEmail.id)) {
      setSelectedEmail(null);
    }
  };

  const handleBulkMarkRead = () => {
    selectedIds.forEach((id) => markEmailRead(id));
    setSelectedIds([]);
  };

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    sendEmail(currentAccount, composeTo.trim(), composeSubject.trim(), composeBody.trim());
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

  // Count unread for primary, social, promotions
  const socialUnread = currentMailboxEmails.filter((m) => m.category === 'social' && !m.read).length;
  const promoUnread = currentMailboxEmails.filter((m) => m.category === 'promotions' && !m.read).length;

  return (
    <div className="flex-1 flex overflow-hidden bg-white rounded-2xl shadow-xs border border-[#dadce0]/80 h-[calc(100vh-5rem)] select-none">
      {/* Main Mail Center Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {/* Top Gmail Action Toolbar */}
        <div className="h-12 border-b border-[#dadce0]/80 px-4 flex items-center justify-between bg-white text-[#5f6368] shrink-0 text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            {selectedEmail ? (
              <>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-[#f1f3f4] hover:text-[#202124] rounded-full transition-colors"
                  title="Back to Inbox"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-[#dadce0] mx-1" />
                <button
                  onClick={() => {
                    deleteEmail(selectedEmail.id);
                    setSelectedEmail(null);
                  }}
                  className="p-2 hover:bg-[#f1f3f4] hover:text-[#d93025] rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => markSpam(selectedEmail.id, selectedEmail.folder !== 'spam')}
                  className="p-2 hover:bg-[#f1f3f4] hover:text-[#202124] rounded-full transition-colors"
                  title="Report spam"
                >
                  <AlertOctagon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => snoozeEmail(selectedEmail.id)}
                  className="p-2 hover:bg-[#f1f3f4] hover:text-[#202124] rounded-full transition-colors"
                  title="Snooze"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setComposeTo(selectedEmail.from);
                    setComposeSubject(`Re: ${selectedEmail.subject}`);
                    setComposeBody(`\n\n--- Original Message ---\n${selectedEmail.body}`);
                    if (onOpenCompose) onOpenCompose();
                    else setLocalComposeOpen(true);
                  }}
                  className="p-2 hover:bg-[#f1f3f4] hover:text-[#202124] rounded-full transition-colors"
                  title="Reply in window"
                >
                  <Reply className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Select All Checkbox */}
                <div className="flex items-center">
                  <button
                    onClick={handleSelectAll}
                    className="p-1.5 hover:bg-[#f1f3f4] rounded-md flex items-center"
                    title="Select"
                  >
                    {selectedIds.length > 0 && selectedIds.length === displayedEmails.length ? (
                      <CheckSquare className="w-4 h-4 text-[#1a73e8]" />
                    ) : selectedIds.length > 0 ? (
                      <div className="w-4 h-4 bg-[#1a73e8] rounded-xs flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-white" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4 text-[#5f6368]" />
                    )}
                  </button>
                  <button className="p-1 hover:bg-[#f1f3f4] rounded-md text-[#5f6368]">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {selectedIds.length > 0 ? (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      className="p-2 hover:bg-[#f1f3f4] hover:text-[#d93025] rounded-full transition-colors"
                      title="Delete selected"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleBulkMarkRead}
                      className="p-2 hover:bg-[#f1f3f4] hover:text-[#202124] rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <MailOpen className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-[#5f6368] font-medium ml-2">
                      {selectedIds.length} selected
                    </span>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="p-2 hover:bg-[#f1f3f4] hover:text-[#202124] rounded-full transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 hover:bg-[#f1f3f4] hover:text-[#202124] rounded-full transition-colors"
                      title="More"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Pagination */}
          <div className="flex items-center gap-2 text-[#5f6368] text-xs">
            <span>
              1–{displayedEmails.length} of {displayedEmails.length}
            </span>
            <button className="p-1.5 hover:bg-[#f1f3f4] rounded-full disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-[#f1f3f4] rounded-full disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Tabs (Primary, Social, Promotions - exact Gmail layout) */}
        {!selectedEmail && (initialFolder === 'inbox' || initialFolder === 'webmail') && (
          <div className="flex border-b border-[#dadce0]/80 bg-white text-xs font-medium shrink-0">
            <button
              onClick={() => setActiveTab('primary')}
              className={`flex-1 py-3 px-4 flex items-center justify-start gap-3 border-b-2 transition-colors ${
                activeTab === 'primary'
                  ? 'border-[#0b57d0] text-[#0b57d0] font-bold bg-[#f2f6fc]/50'
                  : 'border-transparent text-[#5f6368] hover:bg-[#f1f3f4]/70 hover:text-[#202124]'
              }`}
            >
              <Inbox className={`w-4 h-4 ${activeTab === 'primary' ? 'text-[#0b57d0]' : 'text-[#5f6368]'}`} />
              <span>Primary</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 py-3 px-4 flex items-center justify-start gap-3 border-b-2 transition-colors ${
                activeTab === 'social'
                  ? 'border-[#1a73e8] text-[#1a73e8] font-bold bg-[#f2f6fc]/50'
                  : 'border-transparent text-[#5f6368] hover:bg-[#f1f3f4]/70 hover:text-[#202124]'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'social' ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`} />
              <div className="flex items-center gap-2">
                <span>Social</span>
                {socialUnread > 0 && (
                  <span className="bg-[#1a73e8] text-white text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                    {socialUnread} new
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex-1 py-3 px-4 flex items-center justify-start gap-3 border-b-2 transition-colors ${
                activeTab === 'promotions'
                  ? 'border-[#188038] text-[#188038] font-bold bg-[#f2f6fc]/50'
                  : 'border-transparent text-[#5f6368] hover:bg-[#f1f3f4]/70 hover:text-[#202124]'
              }`}
            >
              <Tag className={`w-4 h-4 ${activeTab === 'promotions' ? 'text-[#188038]' : 'text-[#5f6368]'}`} />
              <div className="flex items-center gap-2">
                <span>Promotions</span>
                {promoUnread > 0 && (
                  <span className="bg-[#188038] text-white text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                    {promoUnread} new
                  </span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedEmail ? (
            /* Email Reading View (Google Workspace / Gmail Style) */
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              {/* Header Title & Labels */}
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
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full" title="Print email">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full" title="In new window">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sender info bar */}
              <div className="flex items-start justify-between pt-4 border-t border-[#dadce0]/60">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs"
                    style={{ backgroundColor: selectedEmail.avatarColor || '#4285f4' }}
                  >
                    {selectedEmail.senderName?.charAt(0) || selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-[#202124]">
                        {selectedEmail.senderName || selectedEmail.from}
                      </span>
                      <span className="text-xs text-[#5f6368] font-mono">
                        &lt;{selectedEmail.from}&gt;
                      </span>
                    </div>
                    <div className="text-xs text-[#5f6368] flex items-center gap-1 mt-0.5">
                      <span>to {selectedEmail.to === currentAccount ? 'me' : selectedEmail.to}</span>
                      <ChevronDown className="w-3 h-3 text-[#5f6368]" />
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-[#5f6368]">
                  <div>{selectedEmail.date}</div>
                  <div className="flex items-center gap-1 justify-end text-[11px] text-[#137333] mt-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SPF: PASS • DKIM: PASS</span>
                  </div>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="py-4 text-sm text-[#202124] leading-relaxed whitespace-pre-line font-sans border-b border-[#dadce0]/60 pb-8">
                {selectedEmail.body}
              </div>

              {/* Action Buttons: Reply, Forward */}
              {!showReplyBox ? (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="flex items-center gap-2 px-6 py-2 border border-[#dadce0] rounded-full text-xs font-semibold text-[#444746] hover:bg-[#f1f3f4] transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setComposeSubject(`Fwd: ${selectedEmail.subject}`);
                      setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${selectedEmail.from}\nDate: ${selectedEmail.date}\nSubject: ${selectedEmail.subject}\nTo: ${selectedEmail.to}\n\n${selectedEmail.body}`);
                      if (onOpenCompose) onOpenCompose();
                      else setLocalComposeOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2 border border-[#dadce0] rounded-full text-xs font-semibold text-[#444746] hover:bg-[#f1f3f4] transition-colors"
                  >
                    <Forward className="w-4 h-4" />
                    Forward
                  </button>
                </div>
              ) : (
                /* Inline Reply Composer */
                <div className="border border-[#dadce0] rounded-2xl p-4 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#5f6368] border-b border-[#dadce0]/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Reply className="w-3.5 h-3.5" />
                      <span>Replying to <strong>{selectedEmail.from}</strong></span>
                    </div>
                    <button onClick={() => setShowReplyBox(false)} className="p-1 hover:bg-[#f1f3f4] rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply here..."
                    className="w-full text-sm text-[#202124] placeholder-[#5f6368] focus:outline-none resize-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-[#dadce0]/60">
                    <button
                      onClick={handleSendReply}
                      className="flex items-center gap-2 px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold rounded-full shadow-xs transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                    <button onClick={() => setShowReplyBox(false)} className="p-2 hover:bg-[#f1f3f4] text-[#5f6368] rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Email List (exact Gmail multi-line density, hover bar, bold font for unread) */
            <div className="divide-y divide-[#f2f2f2]">
              {displayedEmails.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#5f6368]">
                  <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#5f6368]" />
                  <p className="font-semibold text-sm text-[#202124]">Your {initialFolder} is empty</p>
                  <p className="mt-1">Messages that arrive for {currentAccount} will appear here.</p>
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
                      className={`group flex items-center px-4 py-2 text-xs cursor-pointer transition-colors border-b border-[#f2f2f2] ${
                        isSelected
                          ? 'bg-[#c2dbff]/40'
                          : isUnread
                          ? 'bg-white font-bold text-[#202124]'
                          : 'bg-[#f8fafd] font-normal text-[#5f6368]'
                      } hover:shadow-xs hover:border-[#dadce0] hover:z-10 relative`}
                    >
                      {/* Left: Checkbox, Star, Important marker */}
                      <div className="flex items-center gap-2 mr-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleSelect(email.id, e)}
                          className="p-1 hover:bg-[#dadce0]/50 rounded-xs text-[#5f6368]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#1a73e8]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#dadce0] group-hover:text-[#5f6368]" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleStarEmail(email.id)}
                          className="p-1 hover:bg-[#dadce0]/50 rounded-xs"
                          title="Star"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              email.starred
                                ? 'text-[#f4b400] fill-[#f4b400]'
                                : 'text-[#dadce0] group-hover:text-[#5f6368]'
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => toggleImportantEmail(email.id)}
                          className="p-1 hover:bg-[#dadce0]/50 rounded-xs"
                          title="Important"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              email.important
                                ? 'text-[#f4b400] fill-[#f4b400]'
                                : 'text-[#dadce0] group-hover:text-[#5f6368]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Sender Name */}
                      <div className="w-44 sm:w-52 shrink-0 truncate pr-2">
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
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => markEmailRead(email.id)}
                              className="p-1.5 hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#202124] rounded-full"
                              title={email.read ? 'Mark unread' : 'Mark as read'}
                            >
                              {email.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => snoozeEmail(email.id)}
                              className="p-1.5 hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#202124] rounded-full"
                              title="Snooze"
                            >
                              <Clock className="w-4 h-4" />
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

      {/* Right Side Companion Bar (Google Calendar, Keep, Tasks, Contacts) */}
      <div className="w-14 border-l border-[#dadce0]/80 bg-[#f6f8fc] flex flex-col items-center py-3 gap-4 shrink-0">
        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'calendar' ? null : 'calendar')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'calendar' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="Calendar"
        >
          <Calendar className="w-5 h-5 text-[#4285f4]" />
        </button>

        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'keep' ? null : 'keep')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'keep' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="Keep Notes"
        >
          <Lightbulb className="w-5 h-5 text-[#fbbc04]" />
        </button>

        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'tasks' ? null : 'tasks')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'tasks' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="Tasks"
        >
          <CheckCircle2 className="w-5 h-5 text-[#1a73e8]" />
        </button>

        <button
          onClick={() => setActiveRightPanel(activeRightPanel === 'contacts' ? null : 'contacts')}
          className={`p-2.5 rounded-full transition-colors ${
            activeRightPanel === 'contacts' ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-[#5f6368] hover:bg-[#e8eaed]'
          }`}
          title="Contacts"
        >
          <UserCheck className="w-5 h-5 text-[#34a853]" />
        </button>

        <div className="w-6 h-px bg-[#dadce0] my-1" />

        <button className="p-2 text-[#5f6368] hover:bg-[#e8eaed] rounded-full" title="Get Add-ons">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Companion Bar Slide-out Panel */}
      {activeRightPanel && (
        <div className="w-80 border-l border-[#dadce0] bg-white p-4 flex flex-col overflow-y-auto text-xs shadow-lg animate-in slide-in-from-right duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#dadce0]">
            <h3 className="font-bold text-sm text-[#202124] capitalize flex items-center gap-2">
              {activeRightPanel === 'calendar' && <Calendar className="w-4 h-4 text-[#4285f4]" />}
              {activeRightPanel === 'keep' && <Lightbulb className="w-4 h-4 text-[#fbbc04]" />}
              {activeRightPanel === 'tasks' && <CheckCircle2 className="w-4 h-4 text-[#1a73e8]" />}
              {activeRightPanel === 'contacts' && <UserCheck className="w-4 h-4 text-[#34a853]" />}
              {activeRightPanel}
            </h3>
            <button onClick={() => setActiveRightPanel(null)} className="p-1 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-3">
            {activeRightPanel === 'calendar' && (
              <div className="space-y-2">
                <div className="p-3 bg-[#e8f0fe] rounded-xl text-[#1a73e8]">
                  <div className="font-semibold">Team Sync - Postfix Rollout</div>
                  <div className="text-[11px] opacity-80">Today • 3:00 PM - 3:30 PM</div>
                </div>
                <div className="p-3 bg-[#f1f3f4] rounded-xl text-[#202124]">
                  <div className="font-semibold">DNS TTL Check</div>
                  <div className="text-[11px] text-[#5f6368]">Tomorrow • 10:00 AM</div>
                </div>
              </div>
            )}

            {activeRightPanel === 'keep' && (
              <div className="space-y-2">
                <div className="p-3 bg-[#feefc3] rounded-xl text-[#202124]">
                  <div className="font-semibold">SMTP Ports</div>
                  <div className="text-[11px] text-[#5f6368] mt-1">25 (MTA), 465 (SMTPS), 587 (Submission)</div>
                </div>
                <div className="p-3 bg-[#e6f4ea] rounded-xl text-[#202124]">
                  <div className="font-semibold">DKIM Config</div>
                  <div className="text-[11px] text-[#5f6368] mt-1">Selector: vaway._domainkey</div>
                </div>
              </div>
            )}

            {activeRightPanel === 'tasks' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#f1f3f4]">
                  <CheckSquare className="w-4 h-4 text-[#1a73e8]" />
                  <span className="line-through text-[#5f6368]">Generate SPF & DMARC records</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#f1f3f4]">
                  <Square className="w-4 h-4 text-[#5f6368]" />
                  <span className="text-[#202124]">Test inbound relay from Gmail</span>
                </div>
              </div>
            )}

            {activeRightPanel === 'contacts' && (
              <div className="space-y-2">
                <div className="p-2 rounded-lg hover:bg-[#f1f3f4] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold">A</div>
                  <div>
                    <div className="font-semibold text-[#202124]">Alice Admin</div>
                    <div className="text-[11px] text-[#5f6368]">admin@example.com</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg hover:bg-[#f1f3f4] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#34a853] text-white flex items-center justify-center font-bold">B</div>
                  <div>
                    <div className="font-semibold text-[#202124]">Bob Dev</div>
                    <div className="text-[11px] text-[#5f6368]">bob@example.com</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Compose Window (Docked in bottom right, identical to Gmail) */}
      {composeModalOpen && (
        <div className="fixed bottom-0 right-16 z-50 w-full max-w-lg bg-white rounded-t-2xl shadow-2xl border border-[#dadce0] flex flex-col overflow-hidden text-xs">
          {/* Header */}
          <div className="bg-[#f2f6fc] px-4 py-2.5 flex items-center justify-between border-b border-[#dadce0] select-none">
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
                placeholder="alice@example.com or any address"
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

            {/* Bottom Formatting & Send Toolbar (exact Gmail blue Send button) */}
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
