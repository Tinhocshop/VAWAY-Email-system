import React from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  Globe,
  Users,
  GitFork,
  CheckCircle2,
  RotateCw,
  Server,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { domains, users, aliases, anonAliases, services, restartService, config } = useVawayMail();

  const totalQuotaUsedBytes = users.reduce((acc, u) => acc + (u.quota_used_bytes || 0), 0);
  const totalQuotaAllocatedBytes = users.reduce((acc, u) => acc + (u.quota_bytes || 0), 0);
  const quotaUsedMB = (totalQuotaUsedBytes / (1024 * 1024)).toFixed(1);
  const quotaAllocatedMB = totalQuotaAllocatedBytes > 0 ? (totalQuotaAllocatedBytes / (1024 * 1024)).toFixed(1) : 'Unlimited';

  const runningServices = services.filter((s) => s.status === 'running').length;

  return (
    <div className="space-y-6 select-none">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hosted Domains */}
        <div
          onClick={() => onNavigate('domains')}
          className="bg-white border border-[#dadce0] rounded-2xl p-4.5 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#1a73e8] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#202124]">{domains.length}</div>
            <div className="text-xs text-[#5f6368] font-medium mt-0.5">SaaS Domains Active</div>
          </div>
        </div>

        {/* User Mailboxes */}
        <div
          onClick={() => onNavigate('users')}
          className="bg-white border border-[#dadce0] rounded-2xl p-4.5 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#137333] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#202124]">{users.length}</div>
            <div className="text-xs text-[#5f6368] font-medium mt-0.5">Mailboxes Provisioned</div>
          </div>
        </div>

        {/* Aliases & Anonmail */}
        <div
          onClick={() => onNavigate('aliases')}
          className="bg-white border border-[#dadce0] rounded-2xl p-4.5 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center">
              <GitFork className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#b06000] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#202124]">{aliases.length + anonAliases.length}</div>
            <div className="text-xs text-[#5f6368] font-medium mt-0.5">Virtual & Anon Aliases</div>
          </div>
        </div>

        {/* Mail Storage Quota */}
        <div className="bg-white border border-[#dadce0] rounded-2xl p-4.5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#f3e8fd] text-[#9334e8] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-[#5f6368]">
              {quotaUsedMB} MB / {quotaAllocatedMB} MB
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#202124]">{quotaUsedMB} MB</div>
            <div className="text-xs text-[#5f6368] font-medium mt-0.5">Total Mail Storage In Use</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Services & SaaS Config Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Status */}
        <div className="lg:col-span-2 bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8fafd]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#1a73e8]" />
              <h2 className="text-sm font-bold text-[#202124]">
                Docker Services Status ({runningServices}/{services.length} Healthy)
              </h2>
            </div>
            <button
              onClick={() => {
                services.forEach((s) => restartService(s.service));
              }}
              className="px-3 py-1 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors border border-[#dadce0]"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#5f6368]" />
              Restart All Containers
            </button>
          </div>

          <div className="divide-y divide-[#dadce0]/60">
            {services.map((svc) => (
              <div
                key={svc.service}
                className="p-3.5 flex items-center justify-between hover:bg-[#f8fafd] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#188038] animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-[#202124] flex items-center gap-2">
                      <span>{svc.name}</span>
                      <span className="text-[10px] text-[#5f6368] font-mono font-normal">
                        ({svc.service}:{svc.version})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5f6368]">{svc.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#5f6368] hidden sm:inline">
                    Port: {svc.port}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Running
                  </span>
                  <button
                    onClick={() => restartService(svc.service)}
                    className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                    title="Restart container"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SaaS Quick Config Card */}
        <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[#dadce0]/60 pb-3">
            <h2 className="text-sm font-bold text-[#202124]">VAWAY SaaS Parameters</h2>
            <p className="text-xs text-[#5f6368] mt-0.5">Instance runtime configuration</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#f8fafd] border border-[#dadce0]">
              <div className="text-[#5f6368] text-[11px]">Primary SaaS Domain</div>
              <div className="font-mono font-bold text-[#202124] text-xs mt-0.5">{config.domain}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#f8fafd] border border-[#dadce0]">
              <div className="text-[#5f6368] text-[11px]">Host FQDN</div>
              <div className="font-mono font-bold text-[#1a73e8] text-xs mt-0.5">{config.hostname}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#f8fafd] border border-[#dadce0]">
              <div className="text-[#5f6368] text-[11px]">TLS / SSL Mode</div>
              <div className="font-mono font-bold text-[#137333] text-xs mt-0.5 uppercase">
                {config.tls_flavor} (Auto-Renew)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f8fafd] border border-[#dadce0]">
              <div className="text-[#5f6368] text-[11px]">Max Attachment Size</div>
              <div className="font-mono font-bold text-[#202124] text-xs mt-0.5">
                {(config.message_size_limit / (1024 * 1024)).toFixed(0)} MB
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('setup')}
              className="w-full py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold text-xs transition-colors shadow-xs"
            >
              Mở Trình Tạo Cấu Hình SaaS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
