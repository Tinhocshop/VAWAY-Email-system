export interface Domain {
  name: string;
  max_users: number; // -1 for unlimited
  max_aliases: number; // -1 for unlimited
  max_quota_bytes: number; // in bytes (0 for unlimited)
  signup_enabled: boolean;
  anonmail_enabled: boolean;
  dkim_selector: string;
  dkim_public_key: string;
  comment?: string;
  created_at: string;
}

export interface User {
  email: string;
  localpart: string;
  domain_name: string;
  displayed_name: string;
  quota_bytes: number; // 0 for unlimited
  quota_used_bytes: number;
  global_admin: boolean;
  enabled: boolean;
  enable_imap: boolean;
  enable_pop: boolean;
  spam_enabled: boolean;
  spam_mark_as_read: boolean;
  spam_threshold: number; // typically 80
  auto_reply_enabled: boolean;
  auto_reply_subject: string;
  auto_reply_body: string;
  auto_reply_start?: string;
  auto_reply_end?: string;
  forward_enabled: boolean;
  forward_destination: string[];
  forward_keep: boolean;
  created_at: string;
  comment?: string;
}

export interface Alias {
  email: string;
  localpart: string;
  domain_name: string;
  destination: string[];
  wildcard: boolean;
  created_at: string;
  comment?: string;
}

export interface AnonymousAlias {
  id: string;
  email: string;
  target_user: string;
  domain_name: string;
  description: string;
  received_count: number;
  forwarded_count: number;
  blocked_count: number;
  enabled: boolean;
  created_at: string;
}

export interface Alternative {
  name: string;
  domain_name: string;
  created_at: string;
}

export interface Relay {
  name: string;
  smtp: string;
  comment?: string;
  created_at: string;
}

export interface Token {
  id: string;
  token: string;
  user_email: string;
  ip?: string;
  comment?: string;
  created_at: string;
  expires_at?: string;
}

export interface ServiceStatus {
  name: string;
  service: string;
  port: number | string;
  status: 'running' | 'degraded' | 'stopped';
  version: string;
  description: string;
}

export interface SimulatedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  folder: 'inbox' | 'sent' | 'spam' | 'trash';
  read: boolean;
  spamScore: number;
  dkimStatus: 'pass' | 'fail' | 'none';
  spfStatus: 'pass' | 'softfail' | 'none';
}

export type EmailMessage = SimulatedEmail;

export interface VawayMailConfig {
  sitename: string;
  hostname: string;
  domain: string;
  webmail: 'roundcube' | 'snappymail' | 'none';
  tls_flavor: 'letsencrypt' | 'mail-letsencrypt' | 'cert' | 'mail' | 'notls';
  postmaster: string;
  fetchmail_enabled: boolean;
  message_size_limit: number;
  antivirus_enabled: boolean;
  antispam_enabled: boolean;
  secret_key?: string;
  antivirus?: boolean;
  subnet?: string;
  compression?: string;
  compression_level?: number;
  real_ip_from?: string;
  real_ip_header?: string;
  reject_unlisted_recipient?: boolean;
  relayhost?: string;
  relaynets?: string;
  webroot_redirect?: string;
}
