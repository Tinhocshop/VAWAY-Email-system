import React from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  LayoutDashboard,
  Globe2,
  Users,
  GitFork,
  ArrowRightLeft,
  ShieldCheck,
  KeyRound,
  Laptop,
  Mail,
  FileCode,
  ShieldAlert,
  X,
} from 'lucide-react';

export type ViewType =
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpen,
  onClose,
}) => {
  const { currentAccount, users, domains, aliases } = useVawayMail();
  const currentUser = users.find((u) => u.email === currentAccount) || users[0];

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'domains',
      label: 'Mail Domains',
      icon: <Globe2 className="w-4 h-4" />,
      badge: domains.length,
    },
    {
      id: 'users',
      label: 'Mailboxes & Users',
      icon: <Users className="w-4 h-4" />,
      badge: users.length,
    },
    {
      id: 'aliases',
      label: 'Aliases & Anonmail',
      icon: <GitFork className="w-4 h-4" />,
      badge: aliases.length,
    },
    {
      id: 'relays',
      label: 'Relayed Domains',
      icon: <ArrowRightLeft className="w-4 h-4" />,
    },
    {
      id: 'admins',
      label: 'Administrators',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: 'tokens',
      label: 'API Tokens',
      icon: <KeyRound className="w-4 h-4" />,
    },
    {
      id: 'client-setup',
      label: 'Client Setup Guide',
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      id: 'webmail',
      label: 'Webmail & Mailbox',
      icon: <Mail className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      id: 'config-wizard',
      label: 'Config Generator',
      icon: <FileCode className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/vaway.svg" alt="VAWAY Mail Server" className="w-8 h-8 rounded-lg object-contain shadow-sm shadow-sky-500/30" />
            <div>
              <span className="font-bold tracking-tight text-white flex items-center gap-1 text-sm">
                VAWAY
              </span>
              <span className="text-[10px] text-sky-400 font-medium block -mt-0.5">
                Mail Server Suite
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current user card */}
        <div className="p-3 m-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              {currentUser?.displayed_name?.charAt(0) || currentUser?.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">
                {currentUser?.displayed_name || currentUser?.email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-400 truncate">
                  {currentUser?.global_admin ? 'Global Admin' : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isActive
                        ? 'bg-sky-700/80 text-white'
                        : typeof item.badge === 'string'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Postfix + Dovecot
            </span>
            <span className="text-[10px] font-mono text-slate-400">Port 3000</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
            VAWAY Mail Server administration for enterprise mail infrastructure.
          </p>
        </div>
      </aside>
    </>
  );
};
