import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  Menu,
  Globe,
  RotateCcw,
  AlertTriangle,
  Server,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeViewTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeViewTitle }) => {
  const { currentAccount, setCurrentAccount, users, services, resetAllData } = useVawayMail();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [lang, setLang] = useState('English');

  const runningServices = services.filter((s) => s.status === 'running').length;
  const isHealthy = runningServices === services.length;

  const languages = ['English', 'Français', 'Deutsch', 'Español', 'Italiano', 'Nederlands', 'Tiếng Việt', 'Русский'];

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 font-medium">VAWAY</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold">{activeViewTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* System Health Status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          {isHealthy ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Services Up ({runningServices}/{services.length})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {runningServices}/{services.length} Online
            </span>
          )}
        </div>

        {/* Current Account Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg px-2 py-1 text-xs transition-colors">
          <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <select
            value={currentAccount}
            onChange={(e) => setCurrentAccount(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-mono"
            title="Switch authenticated user"
          >
            {users.map((u) => (
              <option key={u.email} value={u.email} className="bg-slate-900 text-slate-200">
                {u.email} {u.global_admin ? '(Admin)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
            title="Change language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">{lang}</span>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 text-xs z-30">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-700/80 transition-colors ${
                    lang === l ? 'text-sky-400 font-medium' : 'text-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Demo State */}
        <button
          onClick={() => {
            if (confirm('Reset all demo data (domains, users, aliases, emails) to default VAWAY state?')) {
              resetAllData();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset all data to defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
