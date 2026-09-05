import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  Laptop,
  Mail,
  ShieldCheck,
  Calendar,
  Smartphone,
  Copy,
  Check,
  Download,
} from 'lucide-react';

export const ClientSetupView: React.FC = () => {
  const { config, currentAccount, users } = useVawayMail();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<'general' | 'apple' | 'thunderbird' | 'outlook' | 'dav'>('general');

  const currentUser = users.find((u) => u.email === currentAccount) || users[0];

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadAppleProfile = () => {
    const profileXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadDisplayName</key>
    <string>VAWAY - ${currentUser?.email}</string>
    <key>PayloadIdentifier</key>
    <string>io.vaway.${currentUser?.email}</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>12345678-ABCD-EF01-2345-6789ABCDEF01</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>EmailAccountDescription</key>
            <string>${currentUser?.displayed_name} (${currentUser?.email})</string>
            <key>EmailAccountType</key>
            <string>EmailTypeIMAP</string>
            <key>EmailAddress</key>
            <string>${currentUser?.email}</string>
            <key>IncomingMailServerHostName</key>
            <string>${config.hostname}</string>
            <key>IncomingMailServerPortNumber</key>
            <integer>993</integer>
            <key>IncomingMailServerUseSSL</key>
            <true/>
            <key>IncomingMailServerUsername</key>
            <string>${currentUser?.email}</string>
            <key>OutgoingMailServerHostName</key>
            <string>${config.hostname}</string>
            <key>OutgoingMailServerPortNumber</key>
            <integer>465</integer>
            <key>OutgoingMailServerUseSSL</key>
            <true/>
            <key>OutgoingMailServerUsername</key>
            <string>${currentUser?.email}</string>
            <key>PayloadType</key>
            <string>com.apple.mail.managed</string>
            <key>PayloadUUID</key>
            <string>87654321-DCBA-10FE-5432-10FEDCBA9876</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
        </dict>
    </array>
</dict>
</plist>`;

    const blob = new Blob([profileXml], { type: 'application/x-apple-aspen-config' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaway-${currentUser?.email}.mobileconfig`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Laptop className="w-5 h-5 text-sky-400" />
          Client Configuration Guide
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Parameters and profiles for connecting email clients (Thunderbird, Outlook, Apple Mail, iOS, Android) to VAWAY Mail Server.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-medium">
        <button
          onClick={() => setSelectedClient('general')}
          className={`py-3 border-b-2 transition-colors ${
            selectedClient === 'general' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Server Parameters
        </button>
        <button
          onClick={() => setSelectedClient('apple')}
          className={`py-3 border-b-2 transition-colors ${
            selectedClient === 'apple' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          iOS & macOS Profile
        </button>
        <button
          onClick={() => setSelectedClient('thunderbird')}
          className={`py-3 border-b-2 transition-colors ${
            selectedClient === 'thunderbird' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Thunderbird
        </button>
        <button
          onClick={() => setSelectedClient('dav')}
          className={`py-3 border-b-2 transition-colors ${
            selectedClient === 'dav' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          CalDAV & CardDAV (Radicale)
        </button>
      </div>

      {selectedClient === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inbound (IMAP/POP3) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Incoming Mail Server (IMAP / POP3)</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                <div className="text-[11px] text-slate-400 mb-1">Server Hostname</div>
                <div className="flex items-center justify-between font-mono text-slate-200 font-semibold">
                  <span>{config.hostname}</span>
                  <button
                    onClick={() => copyText(config.hostname, 'in-host')}
                    className="text-slate-400 hover:text-sky-400"
                  >
                    {copiedKey === 'in-host' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">IMAP (Recommended)</div>
                  <div className="font-mono text-slate-200">Port 993 (SSL/TLS)</div>
                  <div className="text-[10px] text-slate-500 mt-1">or Port 143 (STARTTLS)</div>
                </div>
                <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">POP3</div>
                  <div className="font-mono text-slate-200">Port 995 (SSL/TLS)</div>
                  <div className="text-[10px] text-slate-500 mt-1">or Port 110 (STARTTLS)</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                <div className="text-[11px] text-slate-400 mb-1">Username</div>
                <div className="font-mono text-slate-200">{currentUser?.email} (full email address)</div>
              </div>

              <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                <div className="text-[11px] text-slate-400 mb-1">Authentication Method</div>
                <div className="text-slate-200 font-medium">Normal Password (PLAIN or LOGIN)</div>
              </div>
            </div>
          </div>

          {/* Outbound (SMTP) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Outgoing Mail Server (SMTP Submission)</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                <div className="text-[11px] text-slate-400 mb-1">Server Hostname</div>
                <div className="flex items-center justify-between font-mono text-slate-200 font-semibold">
                  <span>{config.hostname}</span>
                  <button
                    onClick={() => copyText(config.hostname, 'out-host')}
                    className="text-slate-400 hover:text-sky-400"
                  >
                    {copiedKey === 'out-host' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">SMTPS (SSL)</div>
                  <div className="font-mono text-slate-200">Port 465 (SSL/TLS)</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Recommended</div>
                </div>
                <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                  <div className="text-[11px] text-slate-400 mb-0.5">Submission</div>
                  <div className="font-mono text-slate-200">Port 587 (STARTTLS)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Standard</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                <div className="text-[11px] text-slate-400 mb-1">Username & Authentication</div>
                <div className="font-mono text-slate-200">{currentUser?.email}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Requires authentication (same as incoming)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedClient === 'apple' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-800 rounded-xl">
              <Smartphone className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Apple Mail / iOS Profile Provisioning</h3>
              <p className="text-xs text-slate-400">
                Installs automated settings on iPhone, iPad, or Mac for account <span className="font-mono text-slate-200">{currentUser?.email}</span>.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-300 space-y-2">
            <p>
              1. Click the button below to download the standard <span className="font-mono text-sky-400">.mobileconfig</span> payload.
            </p>
            <p>
              2. Open the downloaded file in macOS Settings or iOS Settings &gt; Profile Downloaded.
            </p>
            <p>
              3. Enter your account password when prompted. All incoming IMAP and outgoing SMTP settings are automatically configured!
            </p>
          </div>

          <button
            onClick={handleDownloadAppleProfile}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .mobileconfig Profile
          </button>
        </div>
      )}

      {selectedClient === 'thunderbird' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 max-w-2xl">
          <h3 className="font-semibold text-white text-sm">Mozilla Thunderbird Auto-Configuration</h3>
          <p className="text-xs text-slate-400">
            VAWAY automatically serves an RFC-compliant autoconfig XML endpoint at <span className="font-mono text-sky-300">https://autoconfig.{config.hostname}/mail/config-v1.1.xml</span>.
          </p>

          <div className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-300 space-y-2">
            <p>
              Simply open Thunderbird &gt; Account Settings &gt; Add Mail Account, enter your name, email (<span className="font-mono text-slate-200">{currentUser?.email}</span>), and password.
            </p>
            <p>
              Thunderbird will automatically detect IMAP on 993 SSL and SMTP on 465 SSL via the DNS CNAME record!
            </p>
          </div>
        </div>
      )}

      {selectedClient === 'dav' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Radicale WebDAV (Contacts & Calendars)</h3>
          </div>
          <p className="text-xs text-slate-400">
            VAWAY bundles the Radicale server to sync address books and calendar appointments.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
              <div className="text-[11px] text-slate-400 mb-1">CalDAV (Calendar URL)</div>
              <div className="font-mono text-slate-200">https://{config.hostname}/webdav/{currentUser?.email}/</div>
            </div>
            <div className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg">
              <div className="text-[11px] text-slate-400 mb-1">CardDAV (Contacts URL)</div>
              <div className="font-mono text-slate-200">https://{config.hostname}/webdav/{currentUser?.email}/contacts/</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
