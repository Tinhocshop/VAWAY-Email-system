import React from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import { ShieldAlert, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';

export const AdminsView: React.FC = () => {
  const { users, updateUser } = useVawayMail();

  const globalAdmins = users.filter((u) => u.global_admin);
  const regularUsers = users.filter((u) => !u.global_admin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          Mail Server Administrators
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage users who possess administrative access to the VAWAY web panel and configuration settings.
        </p>
      </div>

      {/* Global Admins Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Active Global Administrators ({globalAdmins.length})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {globalAdmins.map((admin) => (
            <div
              key={admin.email}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  {admin.displayed_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-200 font-mono">{admin.email}</div>
                  <div className="text-[11px] text-slate-400">
                    {admin.displayed_name} • Full root permissions across all domains
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Root Superuser
                </span>
                {globalAdmins.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Revoke global admin permissions from ${admin.email}?`)) {
                        updateUser(admin.email, { global_admin: false });
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded transition-colors"
                  >
                    Revoke Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promote Users Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Promote Mailbox to Administrator
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Select an existing mailbox to grant full VAWAY management capabilities.
          </p>
        </div>

        <div className="p-4 space-y-2">
          {regularUsers.length === 0 ? (
            <div className="text-xs text-slate-500">All registered mailboxes are already administrators.</div>
          ) : (
            regularUsers.map((u) => (
              <div
                key={u.email}
                className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono text-slate-200">{u.email}</div>
                  <div className="text-[11px] text-slate-400">{u.displayed_name} ({u.domain_name})</div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Promote ${u.email} to Global Administrator?`)) {
                      updateUser(u.email, { global_admin: true });
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-medium transition-colors"
                >
                  Promote to Admin
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
