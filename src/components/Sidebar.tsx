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
  UserCheck,
  Shield,
  Download,
  Copy,
  Check,
  Zap,
  Mail,
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
  onOpenCompose?: (recipient?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpen,
  onClose,
  onOpenCompose,
}) => {
  const { currentAccount, emails, users, domains, aliases, addAnonAlias } = useVawayMail();
  const [isAdminExpanded, setIsAdminExpanded] = useState(true);
  const [isDirectoryExpanded, setIsDirectoryExpanded] = useState(true);
  const [isQuickToolsExpanded, setIsQuickToolsExpanded] = useState(true);
  const [copiedPort, setCopiedPort] = useState(false);
  const [quickCreatedEmail, setQuickCreatedEmail] = useState<string | null>(null);

  const currentUser = users.find((u) => u.email === currentAccount) || users[0];
  const currentDomain = domains.find((d) => d.name === currentUser?.domain_name) || domains[0];

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

  // Quick action: 1-Click Anonmail Alias Generator
  const handleCreateQuickAnonmail = () => {
    const domainName = currentDomain?.name || 'example.com';
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const aliasAddress = `shield_${randomSuffix}@${domainName}`;
    const desc = `Quick Shield protection created at ${new Date().toLocaleTimeString()}`;
    addAnonAlias(currentAccount, domainName, desc);
    setQuickCreatedEmail(aliasAddress);
    setTimeout(() => setQuickCreatedEmail(null), 6000);
  };

  // Quick action: 1-Click download .mobileconfig for iOS/macOS
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

  // Quick copy IMAP/SMTP ports
  const handleCopyPorts = () => {
    const domainName = currentDomain?.name || 'example.com';
    navigator.clipboard.writeText(
      `IMAP: mail.${domainName}:993 (SSL/TLS)\nSMTP: mail.${domainName}:465 (SSL/TLS)\nUsername: ${currentAccount}`
    );
    setCopiedPort(true);
    setTimeout(() => setCopiedPort(false), 3000);
  };

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

        {/* Compose Button */}
        <div className="p-3">
          <button
            onClick={() => {
              if (onOpenCompose) onOpenCompose();
              onClose();
            }}
            className="flex items-center gap-3 px-5 py-3.5 bg-[#c2e7ff] hover:bg-[#b3dcf7] hover:shadow-md text-[#001d35] rounded-2xl text-sm font-semibold transition-all shadow-xs group w-full"
          >
            {/* Multi-Color Plus Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 36 36">
              <path fill="#4285F4" d="M16 16v14h4V16h14v-4H20V-2h-4v14H2v4h14z" transform="scale(0.8) translate(4, 4)"/>
              <path fill="#FBBC05" d="M30 16H20v-4h10z" transform="scale(0.8) translate(4, 4)"/>
              <path fill="#EA4335" d="M20 16v14h-4V16z" transform="scale(0.8) translate(4, 4)"/>
              <path fill="#34A853" d="M16 20H6v-4h10z" transform="scale(0.8) translate(4, 4)"/>
            </svg>
            <span className="tracking-wide">Compose Email</span>
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

          {/* Company Contacts / Sổ Danh bạ Đồng nghiệp - Bấm gửi thư ngay */}
          <div className="pt-2 border-t border-[#dadce0]/60">
            <button
              onClick={() => setIsDirectoryExpanded(!isDirectoryExpanded)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider hover:text-[#202124]"
            >
              <span>Company Directory</span>
              {isDirectoryExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isDirectoryExpanded && (
              <div className="space-y-1 mt-1 px-1">
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      if (onOpenCompose) onOpenCompose(u.email);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-[#e8eaed]/70 transition-colors text-left group"
                    title={`Click to compose email to ${u.displayed_name}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-[10px]">
                          {u.displayed_name.charAt(0)}
                        </div>
                        {u.enabled && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#137333] ring-1 ring-white" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#202124] group-hover:text-[#0b57d0] truncate">
                          {u.displayed_name}
                        </div>
                        <div className="text-[10px] text-[#5f6368] truncate font-mono">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <Mail className="w-3.5 h-3.5 text-[#5f6368] group-hover:text-[#0b57d0] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

                <button
                  onClick={() => {
                    onSelectView('users');
                    onClose();
                  }}
                  className="w-full text-center py-1.5 text-[11px] text-[#0b57d0] hover:underline font-semibold"
                >
                  View all {users.length} colleagues →
                </button>
              </div>
            )}
          </div>

          {/* Quick SaaS Work Tools (1-Click Utilities) */}
          <div className="pt-2 border-t border-[#dadce0]/60 pb-3">
            <button
              onClick={() => setIsQuickToolsExpanded(!isQuickToolsExpanded)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider hover:text-[#202124]"
            >
              <span>1-Click Mail Tools</span>
              {isQuickToolsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isQuickToolsExpanded && (
              <div className="space-y-1 mt-1">
                {/* 1-Click Anonmail Shield */}
                <button
                  onClick={handleCreateQuickAnonmail}
                  className="w-full flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg text-xs text-[#444746] hover:bg-[#e8eaed]/70 hover:text-[#202124] text-left"
                  title="Generate disposable shield email that forwards to this mailbox"
                >
                  <Shield className="w-4 h-4 text-[#0b57d0] shrink-0" />
                  <span className="truncate">Generate Shield Alias</span>
                </button>

                {quickCreatedEmail && (
                  <div className="mx-2 p-2 bg-[#e6f4ea] border border-[#ceead6] rounded-lg text-[11px] text-[#137333] flex items-center justify-between">
                    <span className="truncate font-mono">{quickCreatedEmail}</span>
                    <span className="text-[10px] font-bold shrink-0 ml-1">Active</span>
                  </div>
                )}

                {/* 1-Click Mobileconfig Download */}
                <button
                  onClick={handleDownloadMobileConfig}
                  className="w-full flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg text-xs text-[#444746] hover:bg-[#e8eaed]/70 hover:text-[#202124] text-left"
                  title="Download Apple Configuration Profile for iOS / macOS Mail"
                >
                  <Download className="w-4 h-4 text-[#137333] shrink-0" />
                  <span className="truncate">Download iOS/Mac Config</span>
                </button>

                {/* 1-Click Copy IMAP/SMTP Specs */}
                <button
                  onClick={handleCopyPorts}
                  className="w-full flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg text-xs text-[#444746] hover:bg-[#e8eaed]/70 hover:text-[#202124] text-left"
                  title="Copy IMAP & SMTP port connection details to clipboard"
                >
                  {copiedPort ? (
                    <Check className="w-4 h-4 text-[#137333] shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#5f6368] shrink-0" />
                  )}
                  <span className="truncate">{copiedPort ? 'Copied IMAP/SMTP!' : 'Copy Server Ports'}</span>
                </button>

                {/* Live DNS & Deliverability Check */}
                <button
                  onClick={() => {
                    onSelectView('domains');
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg text-xs text-[#444746] hover:bg-[#e8eaed]/70 hover:text-[#202124] text-left"
                  title="Inspect MX, SPF, DKIM and DMARC status"
                >
                  <Zap className="w-4 h-4 text-[#f29900] shrink-0" />
                  <span className="truncate">Live DNS / SPF Check</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Quick Toolbar: Real SaaS Shortcuts */}
        <div className="h-10 border-t border-[#dadce0]/60 px-4 flex items-center justify-around text-[#5f6368] bg-[#f6f8fc]">
          <button
            onClick={() => onSelectView('users')}
            className="p-1.5 hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
            title="Mailboxes & Users"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectView('aliases')}
            className="p-1.5 hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
            title="Aliases & Privacy Shields"
          >
            <GitFork className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectView('client-setup')}
            className="p-1.5 hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
            title="Client Setup & Connection Guide"
          >
            <Laptop className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
