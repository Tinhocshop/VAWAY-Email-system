import React from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { ShieldAlert, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';

export const AdminsView: React.FC = () => {
  const { users, updateUser } = useVawayMail();

  const globalAdmins = users.filter((u) => u.global_admin);
  const regularUsers = users.filter((u) => !u.global_admin);

  return (
    <div className="space-y-5 select-none">
      <div>
        <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#1a73e8]" />
          Mail Server Administrators
        </h1>
        <p className="text-xs text-[#5f6368] mt-1">
          Manage accounts with global superuser administrative access to domains, DNS configurations, and tenant rules.
        </p>
      </div>

      {/* Global Admins Section */}
      <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#dadce0] bg-[#f8fafd] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
              Active Superuser Administrators ({globalAdmins.length})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-[#dadce0]/60">
          {globalAdmins.map((admin) => (
            <div
              key={admin.email}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#f8fafd] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#fce8e6] text-[#c5221f] flex items-center justify-center font-bold">
                  {admin.displayed_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[#202124] font-mono">{admin.email}</div>
                  <div className="text-[11px] text-[#5f6368]">
                    {admin.displayed_name} • Full root permissions across all domains
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#e6f4ea] text-[#137333] border border-[#ceead6] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Super Admin
                </span>
                {globalAdmins.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Revoke global admin permissions from ${admin.email}?`)) {
                        updateUser(admin.email, { global_admin: false });
                      }
                    }}
                    className="px-3 py-1 bg-[#f1f3f4] hover:bg-red-50 hover:text-[#d93025] text-[#5f6368] rounded-full transition-colors font-medium text-xs"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promote Users Section */}
      <div className="bg-white border border-[#dadce0] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#dadce0] bg-[#f8fafd]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#1a73e8]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
              Promote Mailbox to Administrator
            </h2>
          </div>
          <p className="text-[11px] text-[#5f6368] mt-0.5">
            Select an existing mailbox to grant full VAWAY management capabilities.
          </p>
        </div>

        <div className="p-4 space-y-2">
          {regularUsers.length === 0 ? (
            <div className="text-xs text-[#5f6368] py-4 text-center">All registered mailboxes are already administrators.</div>
          ) : (
            regularUsers.map((u) => (
              <div
                key={u.email}
                className="p-3.5 rounded-xl bg-[#f8fafd] border border-[#dadce0] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono text-[#202124] font-semibold">{u.email}</div>
                  <div className="text-[11px] text-[#5f6368]">
                    {u.displayed_name} ({u.domain_name})
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Promote ${u.email} to Global Administrator?`)) {
                      updateUser(u.email, { global_admin: true });
                    }
                  }}
                  className="px-3 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-full font-semibold transition-colors text-xs"
                >
                  Make Admin
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
