import React, { useState } from 'react';
import { Domain } from '../types';
import { useVawayMail } from '../context/VawayMailContext';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';

interface DomainDetailsModalProps {
  domain: Domain;
  onClose: () => void;
}

export const DomainDetailsModal: React.FC<DomainDetailsModalProps> = ({ domain, onClose }) => {
  const { getDomainDnsRecords, regenerateDkim, alternatives, addAlternative, deleteAlternative } = useVawayMail();
  const [activeTab, setActiveTab] = useState<'dns' | 'alternatives' | 'dkim'>('dns');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [newAltName, setNewAltName] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  const dnsRecords = getDomainDnsRecords(domain.name);
  const domainAlternatives = alternatives.filter((a) => a.domain_name === domain.name);

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleAddAlternative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAltName.trim()) return;
    addAlternative(newAltName.trim(), domain.name);
    setNewAltName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-[#dadce0] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#202124]">{domain.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] font-semibold">
                DNS & DKIM Keys
              </span>
            </div>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Verify DNS records, RSA-2048 DKIM keys, and alias domain mappings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#dadce0] px-5 gap-6 text-xs font-medium bg-[#f8fafd]">
          <button
            onClick={() => setActiveTab('dns')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'dns'
                ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            Required DNS Records ({dnsRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('dkim')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'dkim'
                ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            DKIM Keys & Selector
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'alternatives'
                ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            Domain Alternatives ({domainAlternatives.length})
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {activeTab === 'dns' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#e8f0fe] rounded-2xl border border-[#d2e3fc] flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#1a73e8] shrink-0 mt-0.5" />
                <p className="text-xs text-[#1a73e8] leading-relaxed">
                  Publish these DNS entries at your domain registrar (Cloudflare, GoDaddy, Namecheap, etc.) to ensure 100% deliverability to Gmail, Yahoo, and Outlook.
                </p>
              </div>

              <div className="space-y-2.5">
                {dnsRecords.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#f8fafd] border border-[#dadce0] space-y-2 hover:border-[#1a73e8] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#e8eaed] text-[#202124]">
                          {rec.type}
                        </span>
                        <span className="font-semibold text-[#202124]">{rec.description}</span>
                      </div>
                      <span className="text-[11px] text-[#5f6368]">TTL: {rec.ttl}s</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div>
                        <span className="text-[#5f6368] block text-[10px] uppercase font-sans">Host / Name</span>
                        <span className="text-[#202124] font-semibold truncate block">{rec.name}</span>
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-[#dadce0]">
                        <span className="text-[#202124] break-all select-all font-mono text-[11px]">{rec.value}</span>
                        <button
                          onClick={() => copyToClipboard(rec.value, idx)}
                          className="p-1.5 hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1a73e8] rounded-md shrink-0 transition-colors"
                          title="Copy record value"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-[#137333]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dkim' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#202124]">DKIM Selector & Public Key</h4>
                  <p className="text-[#5f6368] text-[11px]">RSA-2048 key used to sign all outgoing mail via Postfix</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Regenerate 2048-bit DKIM private/public keypair for ${domain.name}?`)) {
                      regenerateDkim(domain.name);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-full text-xs font-semibold transition-colors border border-[#dadce0]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate Keys
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8fafd] border border-[#dadce0] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5f6368]">DKIM Selector:</span>
                  <span className="font-mono font-bold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded">
                    {domain.dkim_selector}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#5f6368]">Public Key (Base64):</span>
                    <button
                      onClick={() => copyToClipboard(domain.dkim_public_key)}
                      className="flex items-center gap-1 text-[#1a73e8] hover:underline text-[11px]"
                    >
                      {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedKey ? 'Copied' : 'Copy Key'}
                    </button>
                  </div>
                  <pre className="p-3 bg-white border border-[#dadce0] rounded-xl text-[#202124] font-mono text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
                    {domain.dkim_public_key}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alternatives' && (
            <div className="space-y-4">
              <p className="text-[#5f6368]">
                Domain alternatives allow receiving email for secondary domains (e.g. <code>mycompany.net</code>) routed directly to identical mailboxes in <code>{domain.name}</code>.
              </p>

              <form onSubmit={handleAddAlternative} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. mybrand.co"
                  value={newAltName}
                  onChange={(e) => setNewAltName(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-[#f8fafd] border border-[#dadce0] rounded-full text-[#202124] placeholder-[#5f6368] focus:outline-none focus:border-[#1a73e8]"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Alternative
                </button>
              </form>

              <div className="space-y-2">
                {domainAlternatives.length === 0 ? (
                  <div className="p-6 text-center text-[#5f6368] bg-[#f8fafd] rounded-2xl border border-[#dadce0]">
                    No domain alternatives mapped to {domain.name}.
                  </div>
                ) : (
                  domainAlternatives.map((alt) => (
                    <div
                      key={alt.name}
                      className="p-3 bg-white border border-[#dadce0] rounded-xl flex items-center justify-between"
                    >
                      <span className="font-mono text-[#202124] font-semibold">{alt.name}</span>
                      <button
                        onClick={() => deleteAlternative(alt.name)}
                        className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#dadce0] flex justify-end bg-[#f8fafd]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
