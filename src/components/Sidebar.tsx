import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  Bookmark,
  Trash2,
  ShieldAlert,
  Video,
  Keyboard,
  Plus,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Globe2,
  Users,
  GitFork,
  ArrowRightLeft,
  KeyRound,
  Laptop,
  FileCode,
  ShieldCheck,
  User,
  MessageSquare,
  Phone,
  X,
} from 'lucide-react';

export type ViewType =
  | 'inbox'
  | 'starred'
  | 'snoozed'
  | 'sent'
  | 'drafts'
  | 'priority'
  | 'spam'
  | 'trash'
  | 'dashboard'
  | 'domains'
  | 'users'
  | 'aliases'
  | 'relays'
  | 'admins'
  | 'tokens'
  | 'client-setup'
  | 'webmail'
  | 'config-wizard';

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenCompose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpen,
  onClose,
  onOpenCompose,
}) => {
  const { currentAccount, emails, users, domains, aliases } = useVawayMail();
  const [isAdminExpanded, setIsAdminExpanded] = useState(true);
  const [isMeetExpanded, setIsMeetExpanded] = useState(true);
  const [isHangoutsExpanded, setIsHangoutsExpanded] = useState(true);

  const currentUser = users.find((u) => u.email === currentAccount) || users[0];

  const unreadInboxCount = emails.filter(
    (m) => m.to.toLowerCase() === currentAccount.toLowerCase() && (m.folder === 'inbox' || !m.folder) && !m.read
  ).length;

  const starredCount = emails.filter((m) => m.starred).length;
  const draftCount = emails.filter((m) => m.folder === 'drafts').length || 1;

  const mailFolders = [
    {
      id: 'inbox' as ViewType,
      label: 'Inbox',
      icon: <Inbox className="w-4 h-4" />,
      badge: unreadInboxCount > 0 ? unreadInboxCount : undefined,
    },
    {
      id: 'starred' as ViewType,
      label: 'Starred',
      icon: <Star className="w-4 h-4" />,
      badge: starredCount > 0 ? starredCount : undefined,
    },
    {
      id: 'snoozed' as ViewType,
      label: 'Snoozed',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'sent' as ViewType,
      label: 'Sent',
      icon: <Send className="w-4 h-4" />,
    },
    {
      id: 'drafts' as ViewType,
      label: 'Drafts',
      icon: <FileText className="w-4 h-4" />,
      badge: draftCount,
    },
    {
      id: 'priority' as ViewType,
      label: 'Priority Task',
      icon: <Bookmark className="w-4 h-4" />,
      badge: 1,
    },
    {
      id: 'spam' as ViewType,
      label: 'Spam / Junk',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: 'trash' as ViewType,
      label: 'Trash',
      icon: <Trash2 className="w-4 h-4" />,
    },
  ];

  const adminNav = [
    {
      id: 'dashboard' as ViewType,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'domains' as ViewType,
      label: 'Mail Domains',
      icon: <Globe2 className="w-4 h-4" />,
      badge: domains.length,
    },
    {
      id: 'users' as ViewType,
      label: 'Users & Mailboxes',
      icon: <Users className="w-4 h-4" />,
      badge: users.length,
    },
    {
      id: 'aliases' as ViewType,
      label: 'Aliases & Anonmail',
      icon: <GitFork className="w-4 h-4" />,
      badge: aliases.length,
    },
    {
      id: 'relays' as ViewType,
      label: 'Relayed Domains',
      icon: <ArrowRightLeft className="w-4 h-4" />,
    },
    {
      id: 'admins' as ViewType,
      label: 'Administrators',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'tokens' as ViewType,
      label: 'API Tokens',
      icon: <KeyRound className="w-4 h-4" />,
    },
    {
      id: 'client-setup' as ViewType,
      label: 'Client Setup',
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      id: 'config-wizard' as ViewType,
      label: 'Config Generator',
      icon: <FileCode className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#f6f8fc] border-r border-[#dadce0]/60 flex flex-col transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile top close button */}
        <div className="h-14 px-4 flex items-center justify-between md:hidden border-b border-[#dadce0]">
          <span className="font-semibold text-sm text-[#202124]">Navigation</span>
          <button onClick={onClose} className="p-1 text-[#5f6368] hover:text-[#202124]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compose Button (exact Gmail floating style) */}
        <div className="p-3">
          <button
            onClick={() => {
              onOpenCompose && onOpenCompose();
              onClose();
            }}
            className="flex items-center gap-3 px-5 py-3.5 bg-[#c2e7ff] hover:bg-[#b3dcf7] hover:shadow-md text-[#001d35] rounded-2xl text-sm font-semibold transition-all shadow-xs group"
          >
            {/* Google Multi-Color Plus */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 36 36">
              <path fill="#4285F4" d="M16 16v14h4V16h14v-4H20V-2h-4v14H2v4h14z" transform="scale(0.8) translate(4, 4)"/>
              <path fill="#FBBC05" d="M30 16H20v-4h10z" transform="scale(0.8) translate(4, 4)"/>
              <path fill="#EA4335" d="M20 16v14h-4V16z" transform="scale(0.8) translate(4, 4)"/>
              <path fill="#34A853" d="M16 20H6v-4h10z" transform="scale(0.8) translate(4, 4)"/>
            </svg>
            <span className="tracking-wide">Compose</span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs font-medium">
          {/* Main Mail Folders */}
          <div className="space-y-0.5">
            {mailFolders.map((item) => {
              const isActive = activeView === item.id || (item.id === 'inbox' && activeView === 'webmail');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between pl-4 pr-3 py-1.5 rounded-r-full text-xs transition-colors ${
                    isActive
                      ? 'bg-[#fce8e6] text-[#c5221f] font-bold'
                      : 'text-[#202124] hover:bg-[#e8eaed]/70 hover:text-[#202124]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={isActive ? 'text-[#c5221f]' : 'text-[#5f6368]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] px-1 font-semibold ${
                        isActive ? 'text-[#c5221f]' : 'text-[#5f6368]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Management Section */}
          <div className="pt-2 border-t border-[#dadce0]/60">
            <button
              onClick={() => setIsAdminExpanded(!isAdminExpanded)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider hover:text-[#202124]"
            >
              <span>SaaS Mail Admin</span>
              {isAdminExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isAdminExpanded && (
              <div className="space-y-0.5 mt-1">
                {adminNav.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between pl-4 pr-3 py-1.5 rounded-r-full text-xs transition-colors ${
                        isActive
                          ? 'bg-[#e8f0fe] text-[#1a73e8] font-bold'
                          : 'text-[#444746] hover:bg-[#e8eaed]/70 hover:text-[#202124]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={isActive ? 'text-[#1a73e8]' : 'text-[#5f6368]'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            isActive
                              ? 'bg-[#1a73e8] text-white'
                              : 'bg-[#dadce0] text-[#444746]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meet Section (as in screenshot) */}
          <div className="pt-2 border-t border-[#dadce0]/60">
            <button
              onClick={() => setIsMeetExpanded(!isMeetExpanded)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider hover:text-[#202124]"
            >
              <span>Meet</span>
              {isMeetExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isMeetExpanded && (
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => alert('New Google Meet session generated: https://meet.google.com/new')}
                  className="w-full flex items-center gap-3.5 pl-4 pr-3 py-1.5 rounded-r-full text-xs text-[#444746] hover:bg-[#e8eaed]/70 hover:text-[#202124]"
                >
                  <Video className="w-4 h-4 text-[#5f6368]" />
                  <span>New meeting</span>
                </button>
                <button
                  onClick={() => {
                    const code = prompt('Enter meeting code or link:');
                    if (code) alert(`Joining meeting: ${code}`);
                  }}
                  className="w-full flex items-center gap-3.5 pl-4 pr-3 py-1.5 rounded-r-full text-xs text-[#444746] hover:bg-[#e8eaed]/70 hover:text-[#202124]"
                >
                  <Keyboard className="w-4 h-4 text-[#5f6368]" />
                  <span>Join a meeting</span>
                </button>
              </div>
            )}
          </div>

          {/* Hangouts / Chat Section (as in screenshot) */}
          <div className="pt-2 border-t border-[#dadce0]/60">
            <button
              onClick={() => setIsHangoutsExpanded(!isHangoutsExpanded)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider hover:text-[#202124]"
            >
              <span>Hangouts</span>
              {isHangoutsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isHangoutsExpanded && (
              <div className="px-3 py-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-[#4285f4] text-white flex items-center justify-center font-bold text-[10px]">
                        {currentUser?.displayed_name?.charAt(0) || 'A'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#34a853] ring-1 ring-white" />
                    </div>
                    <span className="text-xs text-[#202124] font-medium flex items-center gap-1">
                      {currentUser?.localpart || 'alphrjan'} <ChevronDown className="w-3 h-3 text-[#5f6368]" />
                    </span>
                  </div>
                  <button className="p-1 text-[#5f6368] hover:text-[#202124] hover:bg-[#dadce0] rounded-full">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-2 text-center text-[#5f6368] text-[11px]">
                  <p>No recent chats</p>
                  <button className="text-[#1a73e8] hover:underline font-medium mt-0.5">
                    Start a new one
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Hangouts quick toolbar (icon trio) */}
        <div className="h-10 border-t border-[#dadce0]/60 px-4 flex items-center justify-around text-[#5f6368] bg-[#f6f8fc]">
          <button className="p-1.5 hover:text-[#202124] hover:bg-[#e8eaed] rounded-full" title="Contacts">
            <User className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-[#202124] hover:bg-[#e8eaed] rounded-full" title="Conversations">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:text-[#202124] hover:bg-[#e8eaed] rounded-full" title="Phone Calls">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

