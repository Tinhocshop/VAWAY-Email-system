import React, { useState } from 'react';
import { Domain } from '../types';
import { useVawayMail } from '../context/VawayMailContext';
import {
  X,
  Copy,
  Check,
  Key,
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{domain.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30">
                DNS & Config
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure DNS records, DKIM cryptographic keys, and domain alternatives for this domain.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-5 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dns')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'dns'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            DNS Records Wizard
          </button>
          <button
            onClick={() => setActiveTab('dkim')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'dkim'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            DKIM Keys & Signing
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'alternatives'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Domain Alternatives ({domainAlternatives.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'dns' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg text-xs text-sky-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  Publish these records in your DNS provider zone (Cloudflare, Route53, Namecheap, etc.) so other mail servers can route emails to VAWAY and verify cryptographic signatures.
                </div>
              </div>

              <div className="space-y-3">
                {dnsRecords.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-sky-300 font-mono font-bold text-[10px]">
                          {rec.type}
                        </span>
                        <span className="font-mono text-slate-200 font-medium">{rec.name}</span>
                        <span className="text-[10px] text-slate-400">TTL: {rec.ttl}s</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(rec.value, idx)}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[11px] transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Value</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-slate-300 break-all select-all">
                      {rec.value}
                    </div>

                    <p className="text-[11px] text-slate-400">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dkim' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-200">Domain DKIM Key Pair</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Regenerate DKIM key? You will need to update the public TXT record in your DNS zone.')) {
                        regenerateDkim(domain.name);
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 rounded transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Key
                  </button>
                </div>

                <div className="text-slate-400 text-[11px]">
                  VAWAY signs outbound emails using an internal RSA-2048 key. Receiving MTA hosts verify the signature with the public key published under <span className="font-mono text-sky-300">{domain.dkim_selector || 'vaway'}._domainkey.{domain.name}</span>.
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Public Key (Base64)</span>
                    <button
                      onClick={() => copyToClipboard(domain.dkim_public_key)}
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedKey ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-950 font-mono text-[10px] text-slate-300 rounded border border-slate-800 break-all select-all">
                    {domain.dkim_public_key}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alternatives' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                An alternative domain (alias domain) routes all mail sent to <span className="font-mono text-slate-200">user@alternative.org</span> directly to the identical mailbox <span className="font-mono text-slate-200">user@{domain.name}</span>.
              </div>

              {/* Add form */}
              <form onSubmit={handleAddAlternative} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. mycompany.net"
                  value={newAltName}
                  onChange={(e) => setNewAltName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Alternative
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {domainAlternatives.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-800/30 rounded-lg">
                    No alternative domains mapped yet.
                  </div>
                ) : (
                  domainAlternatives.map((alt) => (
                    <div
                      key={alt.name}
                      className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-200">{alt.name}</span>
                        <span className="text-slate-500">→</span>
                        <span className="font-mono text-slate-400">{domain.name}</span>
                      </div>
                      <button
                        onClick={() => deleteAlternative(alt.name)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
                        title="Delete alternative domain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
