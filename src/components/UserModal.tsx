import React, { useState } from 'react';
import { User } from '../types';
import { useVawayMail } from '../context/VawayMailContext';
import {
  X,
  Mail,
  Plane,
  Forward,
  ShieldCheck,
} from 'lucide-react';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  const { domains, addUser, updateUser } = useVawayMail();
  const isEditing = !!user;

  const [activeTab, setActiveTab] = useState<'general' | 'vacation' | 'forward' | 'security'>('general');

  const [formData, setFormData] = useState({
    localpart: user ? user.email.split('@')[0] : '',
    domain_name: user ? user.domain_name : domains[0]?.name || 'example.com',
    displayed_name: user ? user.displayed_name : '',
    password: '',
    quota_gb: user ? (user.quota_bytes / (1024 * 1024 * 1024)).toFixed(0) : '15',
    enabled: user ? user.enabled : true,
    global_admin: user ? user.global_admin : false,
    auto_reply_enabled: user ? user.auto_reply_enabled : false,
    auto_reply_body: user ? user.auto_reply_body || '' : '',
    forward_enabled: user ? user.forward_enabled : false,
    forward_destination: user ? user.forward_destination?.join(', ') || '' : '',
    forward_keep: user ? user.forward_keep : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quotaBytes = Number(formData.quota_gb) * 1024 * 1024 * 1024;
    const destinations = formData.forward_destination
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditing && user) {
      updateUser(user.email, {
        displayed_name: formData.displayed_name,
        quota_bytes: quotaBytes,
        enabled: formData.enabled,
        global_admin: formData.global_admin,
        auto_reply_enabled: formData.auto_reply_enabled,
        auto_reply_body: formData.auto_reply_body,
        forward_enabled: formData.forward_enabled,
        forward_destination: destinations,
        forward_keep: formData.forward_keep,
      });
    } else {
      const email = `${formData.localpart.toLowerCase().trim()}@${formData.domain_name.toLowerCase()}`;
      addUser({
        email,
        localpart: formData.localpart.toLowerCase().trim(),
        domain_name: formData.domain_name.toLowerCase(),
        displayed_name: formData.displayed_name || formData.localpart,
        quota_bytes: quotaBytes,
        quota_used_bytes: 0,
        enabled: formData.enabled,
        global_admin: formData.global_admin,
        auto_reply_enabled: formData.auto_reply_enabled,
        auto_reply_subject: 'Out of Office Auto-Reply',
        auto_reply_body: formData.auto_reply_body,
        forward_enabled: formData.forward_enabled,
        forward_destination: destinations,
        forward_keep: formData.forward_keep,
        created_at: new Date().toISOString(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-[#dadce0] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#202124]">
              {isEditing ? `Edit Mailbox: ${user?.email}` : 'Provision New Mailbox'}
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Configure user credentials, mailbox capacity, auto-responder, and forwarding.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#dadce0] px-5 gap-6 text-xs font-medium bg-[#f8fafd]">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'general'
                ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            General Info
          </button>
          <button
            onClick={() => setActiveTab('vacation')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'vacation'
                ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            Out of Office
          </button>
          <button
            onClick={() => setActiveTab('forward')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'forward'
                ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Forward className="w-3.5 h-3.5" />
            Forwarding
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'security'
                ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Permissions
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {activeTab === 'general' && (
            <>
              {!isEditing ? (
                <div>
                  <label className="block text-[#5f6368] font-semibold mb-1">Email Address</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={formData.localpart}
                      onChange={(e) => setFormData({ ...formData, localpart: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                    />
                    <span className="text-[#5f6368] font-bold text-sm">@</span>
                    <select
                      value={formData.domain_name}
                      onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                      className="px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                    >
                      {domains.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Display Name / Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.displayed_name}
                  onChange={(e) => setFormData({ ...formData, displayed_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-[#5f6368] font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter secure mailbox password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#5f6368] font-semibold mb-1">Mailbox Storage Quota (GB)</label>
                <input
                  type="number"
                  required
                  value={formData.quota_gb}
                  onChange={(e) => setFormData({ ...formData, quota_gb: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user_enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded text-[#1a73e8]"
                />
                <label htmlFor="user_enabled" className="text-[#202124] font-medium cursor-pointer">
                  Account is active and allowed to login
                </label>
              </div>
            </>
          )}

          {activeTab === 'vacation' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vacation_chk"
                  checked={formData.auto_reply_enabled}
                  onChange={(e) => setFormData({ ...formData, auto_reply_enabled: e.target.checked })}
                  className="rounded text-[#1a73e8]"
                />
                <label htmlFor="vacation_chk" className="text-[#202124] font-semibold cursor-pointer">
                  Enable Out of Office Auto-Reply
                </label>
              </div>

              {formData.auto_reply_enabled && (
                <div>
                  <label className="block text-[#5f6368] font-semibold mb-1">Auto-Response Message</label>
                  <textarea
                    rows={4}
                    value={formData.auto_reply_body}
                    onChange={(e) => setFormData({ ...formData, auto_reply_body: e.target.value })}
                    placeholder="I am currently away from the office with limited email access..."
                    className="w-full p-3 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'forward' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fwd_chk"
                  checked={formData.forward_enabled}
                  onChange={(e) => setFormData({ ...formData, forward_enabled: e.target.checked })}
                  className="rounded text-[#1a73e8]"
                />
                <label htmlFor="fwd_chk" className="text-[#202124] font-semibold cursor-pointer">
                  Enable Inbound Mail Forwarding
                </label>
              </div>

              {formData.forward_enabled && (
                <>
                  <div>
                    <label className="block text-[#5f6368] font-semibold mb-1">Destination Address(es)</label>
                    <input
                      type="text"
                      value={formData.forward_destination}
                      onChange={(e) => setFormData({ ...formData, forward_destination: e.target.value })}
                      placeholder="personal@gmail.com, backup@company.com"
                      className="w-full px-3.5 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fwd_keep"
                      checked={formData.forward_keep}
                      onChange={(e) => setFormData({ ...formData, forward_keep: e.target.checked })}
                      className="rounded text-[#1a73e8]"
                    />
                    <label htmlFor="fwd_keep" className="text-[#5f6368] cursor-pointer">
                      Keep a local copy in this mailbox
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1a73e8] block">Global Administrator Rights</span>
                  <span className="text-[11px] text-[#1a73e8]">Grants full access to all domains, API keys, and user management.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.global_admin}
                  onChange={(e) => setFormData({ ...formData, global_admin: e.target.checked })}
                  className="rounded text-[#1a73e8] w-4 h-4"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-[#dadce0] flex justify-end gap-2 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f1f3f4] text-[#202124] rounded-full font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold shadow-xs"
            >
              {isEditing ? 'Save Changes' : 'Create Mailbox'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
