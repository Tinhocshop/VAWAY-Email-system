import React, { useState } from 'react';
import { useVawayMail } from '../context/VawayMailContext';
import {
  FileCode,
  Copy,
  Check,
  Terminal,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCode className="w-5 h-5 text-sky-400" />
          VAWAY SaaS Infrastructure & Config Generator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cấu hình thông số kỹ thuật chuẩn cho dịch vụ SaaS Email doanh nghiệp theo tên miền riêng. Tự động sinh file <span className="font-mono text-sky-300">vaway.env</span> và <span className="font-mono text-sky-300">docker-compose.yml</span>.
        </p>
      </div>

      {/* SaaS Preset Profiles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Cấu hình mẫu nhanh cho SaaS (SaaS Architecture Presets)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => applyPreset('direct')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
              <Globe className="w-4 h-4" />
              Direct VPS MX
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Gửi trực tiếp từ VPS IP sạch, cổng 25 mở, không dùng relay.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('sendgrid')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
              <Zap className="w-4 h-4" />
              SendGrid Relay
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Relay qua SendGrid (587), tỷ lệ vào Inbox cao, chống chặn port 25.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('ses')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
              <Zap className="w-4 h-4" />
              Amazon SES Relay
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Smart host qua AWS SES, tối ưu chi phí SaaS khối lượng lớn.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('enterprise')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              Enterprise High-Sec
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Nén zstd, quét ClamAV, chống backscatter và bảo mật toàn diện.
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-white">Thông số Môi trường (Environment)</h2>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Secret Key (Mã bí mật hệ thống)</label>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Tên miền SaaS chính (Primary Domain)</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Máy chủ thư FQDN (Hostnames)</label>
              <input
                type="text"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Postmaster Admin</label>
              <input
                type="text"
                value={postmaster}
                onChange={(e) => setPostmaster(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Chứng chỉ SSL / TLS</label>
              <select
                value={tlsFlavor}
                onChange={(e) => setTlsFlavor(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
              >
                <option value="letsencrypt">Let's Encrypt (Tự động cấp phát ACME - Khuyến nghị)</option>
                <option value="cert">Chứng chỉ riêng (/certs)</option>
                <option value="mail">Self-Signed nội bộ</option>
                <option value="notls">Chạy sau Reverse Proxy</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Giao diện Webmail</label>
              <select
                value={webmail}
                onChange={(e) => setWebmail(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
              >
                <option value="roundcube">Roundcube Webmail</option>
                <option value="snappy">SnappyMail</option>
                <option value="none">Chỉ dùng App Mail qua IMAP/POP</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={antivirus}
                onChange={(e) => setAntivirus(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-sky-600"
              />
              <span>Quét mã độc ClamAV Antivirus (Yêu cầu ~1.5GB RAM)</span>
            </label>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Docker Internal Subnet</label>
              <input
                type="text"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
              />
            </div>

            {/* Storage & Performance */}
            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-slate-300 font-semibold mb-2">Tối ưu Nén & Lưu trữ (Storage)</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">COMPRESSION</label>
                  <select
                    value={compression}
                    onChange={(e) => setCompression(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  >
                    <option value="gz">gz (Gzip - Chuẩn tốt nhất)</option>
                    <option value="bz2">bz2 (Bzip2)</option>
                    <option value="lz4">lz4 (Tốc độ cao)</option>
                    <option value="zstd">zstd (Hiện đại, nén cao)</option>
                    <option value="none">none (Không nén)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">LEVEL (1-9)</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={compressionLevel}
                    onChange={(e) => setCompressionLevel(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Reverse Proxy */}
            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-slate-300 font-semibold mb-2">Reverse Proxy & Nhận diện IP Thật</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">REAL_IP_FROM (Subnet tin cậy)</label>
                  <input
                    type="text"
                    value={realIpFrom}
                    onChange={(e) => setRealIpFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">REAL_IP_HEADER</label>
                  <input
                    type="text"
                    value={realIpHeader}
                    onChange={(e) => setRealIpHeader(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Anti-Spam & Relay Outbound */}
            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-slate-300 font-semibold mb-2">Bảo mật Chống Spam & Relay Thư</h3>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={rejectUnlistedRecipient}
                  onChange={(e) => setRejectUnlistedRecipient(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-600"
                />
                <span>REJECT_UNLISTED_RECIPIENT (Chống backscatter/quét hòm thư)</span>
              </label>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 text-[11px]">RELAYHOST (Smart Host Relay)</label>
                    <span className="text-[10px] text-slate-500">Để trống nếu gửi trực tiếp</span>
                  </div>
                  <input
                    type="text"
                    placeholder="VD: [smtp.sendgrid.net]:587 hoặc [email-smtp.us-east-1.amazonaws.com]:587"
                    value={relayhost}
                    onChange={(e) => setRelayhost(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 text-[11px]">RELAYNETS (Dải mạng tin cậy)</label>
                    <span className="text-[10px] text-emerald-400">127.0.0.1/32 (Chống Open Relay)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="127.0.0.1/32"
                    value={relaynets}
                    onChange={(e) => setRelaynets(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">WEBROOT_REDIRECT</label>
                  <input
                    type="text"
                    value={webrootRedirect}
                    onChange={(e) => setWebrootRedirect(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Áp dụng thông số
              </button>
            </div>
          </form>
        </div>

        {/* Output Code Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('env')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'env' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                vaway.env
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'compose' ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                docker-compose.yml
              </button>
            </div>

            <button
              onClick={() => copyText(activeTab === 'env' ? generateVawayEnv() : generateDockerCompose(), activeTab === 'compose')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              {(activeTab === 'env' ? copiedEnv : copiedCompose) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép cấu hình</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 flex-1 bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto select-all leading-relaxed">
            {activeTab === 'env' ? generateVawayEnv() : generateDockerCompose()}
          </pre>

          <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Khởi động máy chủ: <code className="text-slate-200 font-mono bg-slate-800 px-1.5 py-0.5 rounded">docker-compose -p vaway up -d</code></span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bảo mật chống Open Relay đạt chuẩn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

