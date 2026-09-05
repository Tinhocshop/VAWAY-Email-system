import React from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  Globe,
  Users,
  GitFork,
  HardDrive,
  ShieldCheck,
  Server,
  Activity,
  CheckCircle2,
  RefreshCw,
  Mail,
  PlusCircle,
} from 'lucide-react';
import { ViewType } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { domains, users, aliases, services, restartService, config, emails } = useVawayMail();

  // Calculate storage stats
  const totalUsedBytes = users.reduce((acc, u) => acc + (u.quota_used_bytes || 0), 0);
  const totalAllocatedBytes = users.reduce((acc, u) => acc + (u.quota_bytes || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const statCards = [
    {
      title: 'Served Domains',
      value: domains.length,
      subtitle: `${domains.filter((d) => d.anonmail_enabled).length} with Anonmail enabled`,
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      onClick: () => onNavigate('domains'),
    },
    {
      title: 'Active Mailboxes',
      value: users.length,
      subtitle: `${users.filter((u) => u.global_admin).length} Global Administrators`,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      onClick: () => onNavigate('users'),
    },
    {
      title: 'Configured Aliases',
      value: aliases.length,
      subtitle: 'Includes forwarders & distribution lists',
      icon: <GitFork className="w-5 h-5 text-emerald-400" />,
      onClick: () => onNavigate('aliases'),
    },
    {
      title: 'Storage Utilization',
      value: formatBytes(totalUsedBytes),
      subtitle: `of ${formatBytes(totalAllocatedBytes)} provisioned`,
      icon: <HardDrive className="w-5 h-5 text-amber-400" />,
      onClick: () => onNavigate('users'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">VAWAY Mail Server Control</h1>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-medium">
              ENTERPRISE READY
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Complete management panel for enterprise mail infrastructure. Manage mail domains, user mailboxes,
            DKIM/SPF/DMARC records, antispam rules, and client setup.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('domains')}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add Domain
          </button>
          <button
            onClick={() => onNavigate('users')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Mailbox
          </button>
          <button
            onClick={() => onNavigate('webmail')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            Open Webmail
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            onClick={stat.onClick}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{stat.title}</span>
              <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-slate-800 transition-colors">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
            <p className="text-[11px] text-slate-400 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Services Grid & Antispam Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Services Status */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-white">VAWAY Mail Server Core Services</h2>
            </div>
            <span className="text-xs text-slate-400">
              Host: <span className="font-mono text-slate-300">{config.hostname}</span>
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {services.map((srv) => (
              <div
                key={srv.service}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      srv.status === 'running'
                        ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                        : 'bg-rose-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{srv.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                        v{srv.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{srv.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                    Port {srv.port}
                  </span>
                  <button
                    onClick={() => restartService(srv.service)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors"
                    title="Simulate service restart"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Authentication Health */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Mail Authentication & Security</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-200">DKIM Signatures Active</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    RSA-2048 keys configured for all served domains with selector <span className="font-mono text-sky-300">vaway</span>.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-200">Rspamd Bayes + Fuzzy Filter</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Heuristic analysis active. Auto-learns from spam/ham folder moves.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-200">TLS Encryption: {config.tls_flavor}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Strict STARTTLS with modern ciphers on 25, 465, 587, 993, 995.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-white">Recent Messages</h2>
              </div>
              <button
                onClick={() => onNavigate('webmail')}
                className="text-[11px] text-sky-400 hover:underline"
              >
                View Webmail
              </button>
            </div>
            <div className="space-y-2">
              {emails.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  onClick={() => onNavigate('webmail')}
                  className="p-2 rounded bg-slate-800/40 hover:bg-slate-800 text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono truncate max-w-[140px] text-slate-300">{m.from}</span>
                    <span>{m.date.split(' ')[1]}</span>
                  </div>
                  <div className="font-medium text-slate-200 truncate mt-0.5">{m.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
