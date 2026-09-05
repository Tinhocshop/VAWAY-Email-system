import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  FileCode,
  Copy,
  Check,
  Settings2,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
} from 'lucide-react';

export const SetupWizardView: React.FC = () => {
  const { config, updateConfig } = useVawayMail();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedCompose, setCopiedCompose] = useState(false);
  const [activeTab, setActiveTab] = useState<'env' | 'compose'>('env');

  // Form options
  const [secretKey, setSecretKey] = useState(config.secret_key || 'V8L2G7L6R9T1W5Q4P0Z8N7M4X2K1J9H3');
  const [domain, setDomain] = useState(config.domain);
  const [hostname, setHostname] = useState(config.hostname);
  const [postmaster, setPostmaster] = useState(config.postmaster);
  const [tlsFlavor, setTlsFlavor] = useState(config.tls_flavor);
  const [webmail, setWebmail] = useState(config.webmail);
  const [antivirus, setAntivirus] = useState(config.antivirus ?? true);
  const [subnet, setSubnet] = useState(config.subnet || '192.168.203.0/24');
  const [compression, setCompression] = useState(config.compression || 'gz');
  const [compressionLevel, setCompressionLevel] = useState(config.compression_level || 6);
  const [realIpFrom, setRealIpFrom] = useState(config.real_ip_from || '127.0.0.1/32,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16');
  const [realIpHeader, setRealIpHeader] = useState(config.real_ip_header || 'X-Forwarded-For');
  const [rejectUnlistedRecipient, setRejectUnlistedRecipient] = useState(config.reject_unlisted_recipient ?? true);
  const [relayhost, setRelayhost] = useState(config.relayhost || '');
  const [relaynets, setRelaynets] = useState(config.relaynets || '127.0.0.1/32');
  const [webrootRedirect, setWebrootRedirect] = useState(config.webroot_redirect || '/webmail');

  // Apply SaaS Preset Profile
  const applyPreset = (type: 'direct' | 'ses' | 'sendgrid' | 'enterprise') => {
    if (type === 'direct') {
      setRelayhost('');
      setRelaynets('127.0.0.1/32');
      setRejectUnlistedRecipient(true);
      setCompression('gz');
      setCompressionLevel(6);
      setTlsFlavor('letsencrypt');
    } else if (type === 'ses') {
      setRelayhost('[email-smtp.us-east-1.amazonaws.com]:587');
      setRelaynets('127.0.0.1/32');
      setRejectUnlistedRecipient(true);
      setCompression('gz');
      setCompressionLevel(6);
      setTlsFlavor('letsencrypt');
    } else if (type === 'sendgrid') {
      setRelayhost('[smtp.sendgrid.net]:587');
      setRelaynets('127.0.0.1/32');
      setRejectUnlistedRecipient(true);
      setCompression('gz');
      setCompressionLevel(6);
      setTlsFlavor('letsencrypt');
    } else if (type === 'enterprise') {
      setRelayhost('');
      setRelaynets('127.0.0.1/32');
      setRejectUnlistedRecipient(true);
      setCompression('zstd');
      setCompressionLevel(6);
      setAntivirus(true);
      setTlsFlavor('letsencrypt');
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      secret_key: secretKey,
      domain,
      hostname,
      postmaster,
      tls_flavor: tlsFlavor,
      webmail,
      antivirus,
      subnet,
      compression,
      compression_level: compressionLevel,
      real_ip_from: realIpFrom,
      real_ip_header: realIpHeader,
      reject_unlisted_recipient: rejectUnlistedRecipient,
      relayhost,
      relaynets,
      webroot_redirect: webrootRedirect,
    });
  };

  const generateVawayEnv = () => {
    return `# ===================================================================
# VAWAY Mail Server - Production SaaS Configuration
# Generated for Multi-tenant Business Email Hosting
# ===================================================================

SECRET_KEY=${secretKey}
SUBNET=${subnet}
DOMAIN=${domain}
HOSTNAMES=${hostname}
POSTMASTER=${postmaster}
TLS_FLAVOR=${tlsFlavor}

# Rate Limiting & Anti-Brute-Force
AUTH_RATELIMIT_IP=10/minute
AUTH_RATELIMIT_USER=50/minute
DISABLE_STATISTICS=False

# DMARC Aggregate & Forensic Reporting
DMARC_RUA=admin@${domain}
DMARC_RUF=admin@${domain}
MESSAGE_SIZE_LIMIT=50000000

# Web Applications & Security
WEBMAIL=${webmail}
ANTIVIRUS=${antivirus ? 'clamav' : 'none'}
WEB_WEBMAIL=/webmail
WEB_ADMIN=/admin
SITENAME=${config.sitename}
WEBSITE=https://${hostname}

# Storage Compression (gz/lz4/zstd)
COMPRESSION=${compression}
COMPRESSION_LEVEL=${compressionLevel}

# Reverse Proxy & Real IP Subnets
REAL_IP_FROM=${realIpFrom}
REAL_IP_HEADER=${realIpHeader}

# Anti-Backscatter & Recipient Validation (yes/no)
REJECT_UNLISTED_RECIPIENT=${rejectUnlistedRecipient ? 'yes' : 'no'}

# Outbound Smart Host Relay (Amazon SES / SendGrid / Brevo)
RELAYHOST=${relayhost}
RELAYNETS=${relaynets}

# Navigation Redirect
WEBROOT_REDIRECT=${webrootRedirect}
`;
  };

  const generateDockerCompose = () => {
    return `version: '2.2'

services:
  front:
    image: ghcr.io/vaway/nginx:2.0
    restart: always
    env_file: vaway.env
    ports:
      - "80:80"
      - "443:443"
      - "25:25"
      - "465:465"
      - "587:587"
      - "110:110"
      - "995:995"
      - "143:143"
      - "993:993"
    volumes:
      - "/vaway/certs:/certs"
      - "/vaway/overrides/nginx:/overrides:ro"

  admin:
    image: ghcr.io/vaway/admin:2.0
    restart: always
    env_file: vaway.env
    volumes:
      - "/vaway/data:/data"
      - "/vaway/dkim:/dkim"

  imap:
    image: ghcr.io/vaway/dovecot:2.0
    restart: always
    env_file: vaway.env
    volumes:
      - "/vaway/mail:/mail"
      - "/vaway/overrides/dovecot:/overrides:ro"

  smtp:
    image: ghcr.io/vaway/postfix:2.0
    restart: always
    env_file: vaway.env
    volumes:
      - "/vaway/mailqueue:/queue"
      - "/vaway/overrides/postfix:/overrides:ro"

  antispam:
    image: ghcr.io/vaway/rspamd:2.0
    restart: always
    env_file: vaway.env
    volumes:
      - "/vaway/filter:/var/lib/rspamd"
      - "/vaway/overrides/rspamd:/overrides:ro"

${antivirus ? `  antivirus:
    image: ghcr.io/vaway/clamav:2.0
    restart: always
    env_file: vaway.env
    volumes:
      - "/vaway/filter:/data"
` : ''}
${webmail === 'roundcube' ? `  webmail:
    image: ghcr.io/vaway/webmail:2.0
    restart: always
    env_file: vaway.env
    volumes:
      - "/vaway/webmail:/data"
` : ''}`;
  };

  const copyText = (text: string, isCompose: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCompose) {
      setCopiedCompose(true);
      setTimeout(() => setCopiedCompose(false), 2000);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  return (
    <div className="space-y-5 select-none">
      <div>
        <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
          <FileCode className="w-5 h-5 text-[#1a73e8]" />
          VAWAY SaaS Infrastructure & Config Generator
        </h1>
        <p className="text-xs text-[#5f6368] mt-1">
          Cấu hình thông số kỹ thuật chuẩn cho dịch vụ SaaS Email doanh nghiệp theo tên miền riêng. Tự động sinh file <span className="font-mono text-[#1a73e8] font-semibold">vaway.env</span> và <span className="font-mono text-[#1a73e8] font-semibold">docker-compose.yml</span>.
        </p>
      </div>

      {/* SaaS Preset Profiles */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#f29900]" />
          <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Cấu hình mẫu nhanh cho SaaS (SaaS Architecture Presets)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => applyPreset('direct')}
            className="p-3.5 bg-[#f8fafd] hover:bg-[#e8f0fe] border border-[#dadce0] rounded-2xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-[#1a73e8] font-bold text-xs mb-1">
              <Globe className="w-4 h-4" />
              Direct VPS MX
            </div>
            <p className="text-[11px] text-[#5f6368] leading-snug">
              Gửi trực tiếp từ VPS IP sạch, cổng 25 mở, không dùng relay.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('sendgrid')}
            className="p-3.5 bg-[#f8fafd] hover:bg-[#e6f4ea] border border-[#dadce0] rounded-2xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-[#188038] font-bold text-xs mb-1">
              <Zap className="w-4 h-4" />
              SendGrid Relay
            </div>
            <p className="text-[11px] text-[#5f6368] leading-snug">
              Relay qua SendGrid (587), tỷ lệ vào Inbox cao, chống chặn port 25.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('ses')}
            className="p-3.5 bg-[#f8fafd] hover:bg-[#fef7e0] border border-[#dadce0] rounded-2xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-[#b06000] font-bold text-xs mb-1">
              <Zap className="w-4 h-4" />
              Amazon SES Relay
            </div>
            <p className="text-[11px] text-[#5f6368] leading-snug">
              Smart host qua AWS SES, tối ưu chi phí SaaS khối lượng lớn.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('enterprise')}
            className="p-3.5 bg-[#f8fafd] hover:bg-[#f3e8fd] border border-[#dadce0] rounded-2xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-[#9334e8] font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              Enterprise High-Sec
            </div>
            <p className="text-[11px] text-[#5f6368] leading-snug">
              Nén zstd, quét ClamAV, chống backscatter và bảo mật toàn diện.
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Settings Form */}
        <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#dadce0]/60 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#1a73e8]" />
              <h2 className="text-sm font-bold text-[#202124]">Thông số Môi trường (Environment)</h2>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Secret Key (Mã bí mật hệ thống)</label>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono text-[11px] focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Tên miền SaaS chính (Primary Domain)</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Máy chủ thư FQDN (Hostnames)</label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Postmaster Admin</label>
              <input
                type="text"
                value={postmaster}
                onChange={(e) => setPostmaster(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">TLS / SSL Mode</label>
              <select
                value={tlsFlavor}
                onChange={(e) => setTlsFlavor(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              >
                <option value="letsencrypt">Let's Encrypt (Automated ACME)</option>
                <option value="mail-letsencrypt">Let's Encrypt with Mail subdomains</option>
                <option value="cert">Custom Certificate (/certs volume)</option>
                <option value="notls">Disabled (Plain Text)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Webmail Client Engine</label>
              <select
                value={webmail}
                onChange={(e) => setWebmail(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              >
                <option value="roundcube">Roundcube Webmail</option>
                <option value="snappymail">Snappymail</option>
                <option value="none">None (API / Headless Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Storage Compression</label>
              <select
                value={compression}
                onChange={(e) => setCompression(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
              >
                <option value="gz">Gzip (.gz - Standard)</option>
                <option value="zstd">Zstandard (zstd - High Ratio)</option>
                <option value="lz4">LZ4 (Fastest I/O)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Docker Subnet</label>
              <input
                type="text"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[#5f6368] font-semibold">Relayhost (Smart Host SMTP trung gian)</label>
                <span className="text-[10px] text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full font-medium">Tùy chọn</span>
              </div>
              <input
                type="text"
                placeholder="Để trống nếu gửi trực tiếp từ VPS, hoặc [smtp.sendgrid.net]:587"
                value={relayhost}
                onChange={(e) => setRelayhost(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
              {/* 1-Click Providers */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setRelayhost('')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    relayhost === ''
                      ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc] font-semibold'
                      : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                  }`}
                >
                  Direct VPS (Trống)
                </button>
                <button
                  type="button"
                  onClick={() => setRelayhost('[smtp.sendgrid.net]:587')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    relayhost === '[smtp.sendgrid.net]:587'
                      ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc] font-semibold'
                      : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                  }`}
                >
                  SendGrid
                </button>
                <button
                  type="button"
                  onClick={() => setRelayhost('[email-smtp.us-east-1.amazonaws.com]:587')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    relayhost === '[email-smtp.us-east-1.amazonaws.com]:587'
                      ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc] font-semibold'
                      : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                  }`}
                >
                  AWS SES
                </button>
                <button
                  type="button"
                  onClick={() => setRelayhost('[smtp-relay.brevo.com]:587')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    relayhost === '[smtp-relay.brevo.com]:587'
                      ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc] font-semibold'
                      : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
                  }`}
                >
                  Brevo
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[#5f6368] font-semibold">Relaynets (Mạng nội bộ cho phép gửi)</label>
                <span className="text-[10px] text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full font-medium">Bảo mật chuẩn</span>
              </div>
              <input
                type="text"
                placeholder="127.0.0.1/32"
                value={relaynets}
                onChange={(e) => setRelaynets(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
              <p className="text-[10px] text-[#5f6368] mt-1 leading-snug">
                Khuyến nghị giữ nguyên <span className="font-mono text-[#202124] font-semibold">127.0.0.1/32</span> để chống Open Relay 100%.
              </p>
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Real IP Subnets</label>
              <input
                type="text"
                value={realIpFrom}
                onChange={(e) => setRealIpFrom(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Real IP Header</label>
              <input
                type="text"
                value={realIpHeader}
                onChange={(e) => setRealIpHeader(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div>
              <label className="block text-[#5f6368] font-semibold mb-1">Webroot Redirect</label>
              <input
                type="text"
                value={webrootRedirect}
                onChange={(e) => setWebrootRedirect(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] font-mono focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold transition-colors shadow-xs"
              >
                Cập nhật cấu hình
              </button>
            </div>
          </form>
        </div>

        {/* Output Code preview */}
        <div className="lg:col-span-2 bg-white border border-[#dadce0] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-[#dadce0]/60 pb-3">
            <div className="flex items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab('env')}
                className={`pb-1 border-b-2 font-semibold transition-colors ${
                  activeTab === 'env'
                    ? 'border-[#0b57d0] text-[#0b57d0]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124]'
                }`}
              >
                vaway.env (Config)
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`pb-1 border-b-2 font-semibold transition-colors ${
                  activeTab === 'compose'
                    ? 'border-[#0b57d0] text-[#0b57d0]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124]'
                }`}
              >
                docker-compose.yml
              </button>
            </div>

            <button
              onClick={() => copyText(activeTab === 'env' ? generateVawayEnv() : generateDockerCompose(), activeTab === 'compose')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-full text-xs font-semibold transition-colors border border-[#dadce0]"
            >
              {(activeTab === 'env' ? copiedEnv : copiedCompose) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#137333]" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép file</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 bg-[#1e1e1e] rounded-2xl p-4 overflow-auto font-mono text-xs text-[#d4d4d4] select-all max-h-[500px]">
            <pre className="whitespace-pre">
              {activeTab === 'env' ? generateVawayEnv() : generateDockerCompose()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
