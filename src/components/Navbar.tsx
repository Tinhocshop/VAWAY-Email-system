import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  Menu,
  Search,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  Grid,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  HardDrive,
  LogOut,
  Shield,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeViewTitle: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  searchTerm = '',
  onSearchChange,
  onOpenSettings,
}) => {
  const { currentAccount, setCurrentAccount, users, services, resetAllData } = useVawayMail();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const currentUser = users.find((u) => u.email === currentAccount) || users[0];
  const runningServices = services.filter((s) => s.status === 'running').length;
  const isHealthy = runningServices === services.length;

  const usedGb = currentUser ? (currentUser.quota_used_bytes / (1024 * 1024 * 1024)).toFixed(1) : '0';
  const totalGb = currentUser && currentUser.quota_bytes > 0 ? (currentUser.quota_bytes / (1024 * 1024 * 1024)).toFixed(0) : 'Unlimited';

  return (
    <>
      <header className="h-16 bg-[#f6f8fc] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left: Hamburger & Gmail Logo */}
        <div className="flex items-center gap-3 min-w-[240px]">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
            title="Main menu"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" title="VAWAY Gmail Business Suite">
            {/* Google / Gmail Envelope Logo SVG */}
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 6.75V17.25C1.5 18.4926 2.50736 19.5 3.75 19.5H6.75V11.25L12 15L17.25 11.25V19.5H20.25C21.4926 19.5 22.5 18.4926 22.5 17.25V6.75L12 14.25L1.5 6.75Z" fill="#EA4335"/>
              <path d="M20.25 4.5H17.25V11.25L22.5 6.75V6C22.5 5.17157 21.8284 4.5 21 4.5H20.25Z" fill="#FBBC04"/>
              <path d="M17.25 4.5H6.75L12 8.25L17.25 4.5Z" fill="#EA4335"/>
              <path d="M6.75 4.5H3.75C2.92157 4.5 2.25 5.17157 2.25 6V6.75L7.5 11.25V4.5H6.75Z" fill="#4285F4"/>
              <path d="M17.25 11.25L22.5 6.75V17.25C22.5 18.4926 21.4926 19.5 20.25 19.5H17.25V11.25Z" fill="#34A853"/>
              <path d="M6.75 11.25L1.5 6.75V17.25C1.5 18.4926 2.50736 19.5 3.75 19.5H6.75V11.25Z" fill="#4285F4"/>
            </svg>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[21px] font-normal tracking-tight text-[#5f6368] font-sans">
                Gmail
              </span>
              <span className="text-[11px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-1.5 py-0.5 rounded-sm">
                VAWAY
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Box (exact Gmail design) */}
        <div className="flex-1 max-w-2xl px-2 sm:px-4">
          <div className="relative flex items-center w-full bg-[#eaf1fb] hover:bg-[#e1eaf5] focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-[#dadce0] rounded-full transition-all h-12 px-4 gap-3">
            <button className="p-1 text-[#5f6368] hover:text-[#202124] rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Search mail"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full bg-transparent text-sm text-[#202124] placeholder-[#5f6368] focus:outline-none"
            />
            <button
              className="p-1.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#dadce0]/60 rounded-full transition-colors"
              title="Show search options"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Quick actions, Apps grid, Profile avatar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Health status dot */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-xs font-medium border border-[#ceead6]"
            title={`Postfix, Dovecot & Rspamd: ${runningServices}/${services.length} Online`}
          >
            {isHealthy ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
                <span>All Services OK</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-[#d93025]" />
                <span className="text-[#d93025]">{runningServices}/{services.length} Online</span>
              </>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
            title="Support & Info"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Google Apps Launcher (9 dots) */}
          <div className="relative">
            <button
              onClick={() => setShowAppsMenu(!showAppsMenu)}
              className="p-2.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#e8eaed] rounded-full transition-colors"
              title="Google apps"
            >
              <Grid className="w-5 h-5" />
            </button>

            {showAppsMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#dadce0] p-4 z-50 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2 rounded-xl hover:bg-[#f1f3f4] cursor-pointer flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">M</div>
                  <span className="text-[#202124] text-[11px]">Gmail</span>
                </div>
                <div className="p-2 rounded-xl hover:bg-[#f1f3f4] cursor-pointer flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">📅</div>
                  <span className="text-[#202124] text-[11px]">Calendar</span>
                </div>
                <div className="p-2 rounded-xl hover:bg-[#f1f3f4] cursor-pointer flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">💡</div>
                  <span className="text-[#202124] text-[11px]">Keep</span>
                </div>
                <div className="p-2 rounded-xl hover:bg-[#f1f3f4] cursor-pointer flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">✓</div>
                  <span className="text-[#202124] text-[11px]">Tasks</span>
                </div>
                <div className="p-2 rounded-xl hover:bg-[#f1f3f4] cursor-pointer flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">👥</div>
                  <span className="text-[#202124] text-[11px]">Contacts</span>
                </div>
                <div className="p-2 rounded-xl hover:bg-[#f1f3f4] cursor-pointer flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">⚙️</div>
                  <span className="text-[#202124] text-[11px]">Admin</span>
                </div>
              </div>
            )}
          </div>

          {/* Profile User Avatar (Brown/Purple/Blue circle as in screenshot) */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-[#8d4e28] text-white flex items-center justify-center font-medium text-sm shadow-xs hover:ring-4 hover:ring-black/5 transition-all"
              title={`Google Account: ${currentUser?.displayed_name} (${currentUser?.email})`}
            >
              {currentUser?.email.charAt(0).toLowerCase()}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-[#dadce0] p-4 z-50 text-xs">
                <div className="flex flex-col items-center text-center p-3 border-b border-[#dadce0]/60">
                  <div className="w-16 h-16 rounded-full bg-[#8d4e28] text-white flex items-center justify-center font-medium text-2xl shadow-sm mb-2">
                    {currentUser?.email.charAt(0).toLowerCase()}
                  </div>
                  <div className="font-semibold text-sm text-[#202124]">
                    {currentUser?.displayed_name || currentUser?.email}
                  </div>
                  <div className="text-xs text-[#5f6368] font-mono mt-0.5">
                    {currentUser?.email}
                  </div>
                  {currentUser?.global_admin && (
                    <span className="mt-1.5 px-2 py-0.5 bg-[#e8f0fe] text-[#1a73e8] rounded-full text-[10px] font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3" /> VAWAY Global Administrator
                    </span>
                  )}
                </div>

                {/* Storage quota */}
                <div className="py-3 px-1 border-b border-[#dadce0]/60">
                  <div className="flex items-center justify-between text-[11px] text-[#5f6368] mb-1">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-[#1a73e8]" /> Storage Used
                    </span>
                    <span>{usedGb} GB / {totalGb} GB</span>
                  </div>
                  <div className="w-full bg-[#e8eaed] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#1a73e8] h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                {/* Switch Account */}
                <div className="py-2">
                  <div className="text-[10px] font-semibold text-[#5f6368] uppercase tracking-wider px-2 py-1">
                    Switch Mailbox
                  </div>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.email}
                        onClick={() => {
                          setCurrentAccount(u.email);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                          u.email === currentAccount ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold' : 'hover:bg-[#f1f3f4] text-[#202124]'
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-xs">{u.displayed_name}</div>
                          <div className="text-[11px] opacity-70 font-mono truncate">{u.email}</div>
                        </div>
                        {u.email === currentAccount && <CheckCircle2 className="w-4 h-4 text-[#1a73e8] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-2 border-t border-[#dadce0]/60 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => {
                      if (confirm('Reset all demo data (domains, users, emails) to default?')) {
                        resetAllData();
                        setShowProfileMenu(false);
                      }
                    }}
                    className="flex items-center gap-1 text-[#5f6368] hover:text-[#d93025] px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
                  </button>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-1 text-[#5f6368] hover:text-[#202124] px-2 py-1.5 rounded-lg hover:bg-[#f1f3f4] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#dadce0] space-y-4">
            <h3 className="text-lg font-bold text-[#202124] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#1a73e8]" />
              VAWAY Gmail Suite
            </h3>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              VAWAY Mail Server integrates a full Google Workspace / Gmail experience with self-hosted Postfix, Dovecot, Rspamd, and ClamAV engines.
            </p>
            <div className="bg-[#f8fafd] p-3 rounded-xl border border-[#e8eaed] text-xs space-y-2 text-[#444746]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34a853]" />
                <span>DKIM Selector: <code className="text-[#1a73e8]">vaway._domainkey</code></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34a853]" />
                <span>Standard SMTP/IMAP: 25, 465, 587, 993, 995</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34a853]" />
                <span>Anti-Spam & ClamAV Virus Scanners Active</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-full transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

