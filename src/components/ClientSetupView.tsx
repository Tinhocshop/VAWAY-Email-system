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
  const [selectedClient, setSelectedClient] = useState<'general' | 'apple' | 'dav'>('general');

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
    <div className="space-y-5 select-none">
      <div>
        <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
          <Laptop className="w-5 h-5 text-[#1a73e8]" />
          Client Configuration Guide
        </h1>
        <p className="text-xs text-[#5f6368] mt-1">
          Parameters and profiles for connecting email clients (Thunderbird, Outlook, Apple Mail, iOS, Android) to VAWAY Mail Server.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#dadce0] gap-6 text-xs font-medium">
        <button
          onClick={() => setSelectedClient('general')}
          className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            selectedClient === 'general'
              ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Standard IMAP / SMTP
        </button>
        <button
          onClick={() => setSelectedClient('apple')}
          className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            selectedClient === 'apple'
              ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Apple iOS / macOS (.mobileconfig)
        </button>
        <button
          onClick={() => setSelectedClient('dav')}
          className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            selectedClient === 'dav'
              ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          CalDAV / CardDAV
        </button>
      </div>

      {/* General Settings */}
      {selectedClient === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Inbound IMAP / POP3 */}
          <div className="p-5 rounded-2xl bg-white border border-[#dadce0] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#dadce0]/60 pb-3">
              <Mail className="w-4 h-4 text-[#1a73e8]" />
              <h2 className="text-sm font-bold text-[#202124]">Incoming Mail Server (IMAP / POP3)</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#5f6368]">Hostname:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#202124]">
                    <span>{config.hostname}</span>
                    <button onClick={() => copyText(config.hostname, 'imap_host')}>
                      {copiedKey === 'imap_host' ? (
                        <Check className="w-3 h-3 text-[#137333]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#5f6368]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5f6368]">IMAP Port:</span>
                  <span className="font-mono font-bold text-[#1a73e8]">993 (SSL/TLS) or 143 (STARTTLS)</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5f6368]">POP3 Port:</span>
                  <span className="font-mono font-bold text-[#1a73e8]">995 (SSL/TLS)</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5f6368]">Username:</span>
                  <span className="font-mono font-bold text-[#202124]">{currentUser?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outbound SMTP */}
          <div className="p-5 rounded-2xl bg-white border border-[#dadce0] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#dadce0]/60 pb-3">
              <ShieldCheck className="w-4 h-4 text-[#188038]" />
              <h2 className="text-sm font-bold text-[#202124]">Outgoing Mail Server (SMTP)</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#5f6368]">Hostname:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#202124]">
                    <span>{config.hostname}</span>
                    <button onClick={() => copyText(config.hostname, 'smtp_host')}>
                      {copiedKey === 'smtp_host' ? (
                        <Check className="w-3 h-3 text-[#137333]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#5f6368]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5f6368]">SMTP Port (SSL/TLS):</span>
                  <span className="font-mono font-bold text-[#188038]">465</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5f6368]">SMTP Submission (STARTTLS):</span>
                  <span className="font-mono font-bold text-[#188038]">587</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#5f6368]">Authentication:</span>
                  <span className="font-medium text-[#202124]">Required (Plain / Login)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apple Profile Download */}
      {selectedClient === 'apple' && (
        <div className="p-6 rounded-2xl bg-white border border-[#dadce0] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[#1a73e8]" />
            <div>
              <h2 className="text-base font-bold text-[#202124]">Automatic Apple Profile (.mobileconfig)</h2>
              <p className="text-xs text-[#5f6368]">Install directly on iOS (iPhone/iPad) or macOS to auto-configure Mail, IMAP, and SMTP with one click.</p>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={handleDownloadAppleProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold text-xs transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Apple Config Profile for {currentUser?.email}
            </button>
          </div>
        </div>
      )}

      {/* CalDAV / CardDAV */}
      {selectedClient === 'dav' && (
        <div className="p-5 rounded-2xl bg-white border border-[#dadce0] shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-[#dadce0]/60 pb-3">
            <Calendar className="w-4 h-4 text-[#f29900]" />
            <h2 className="text-sm font-bold text-[#202124]">Radicale CalDAV & CardDAV Sync</h2>
          </div>

          <div className="p-3.5 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-2">
            <span className="text-[#5f6368] font-semibold">CalDAV / CardDAV Base URL:</span>
            <div className="p-2.5 bg-white font-mono rounded-lg border border-[#dadce0] select-all text-[#202124]">
              https://{config.hostname}/radicale/{currentUser?.email}/
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
