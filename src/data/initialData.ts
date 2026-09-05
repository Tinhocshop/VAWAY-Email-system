import { Domain, User, Alias, AnonymousAlias, Alternative, Relay, Token, ServiceStatus, SimulatedEmail, VawayMailConfig } from '../types';

export const initialConfig: VawayMailConfig = {
  sitename: 'VAWAY Mail Server',
  hostname: 'mail.example.com',
  domain: 'example.com',
  webmail: 'roundcube',
  tls_flavor: 'letsencrypt',
  postmaster: 'admin',
  fetchmail_enabled: true,
  message_size_limit: 50000000, // 50MB
  antivirus_enabled: true,
  antispam_enabled: true,
  compression: 'gz',
  compression_level: 6,
  real_ip_from: '127.0.0.1/32,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16',
  real_ip_header: 'X-Forwarded-For',
  reject_unlisted_recipient: true,
  relayhost: '',
  relaynets: '',
  webroot_redirect: '/webmail',
};

export const initialDomains: Domain[] = [
  {
    name: 'example.com',
    max_users: 50,
    max_aliases: 100,
    max_quota_bytes: 50 * 1024 * 1024 * 1024, // 50 GB
    signup_enabled: false,
    anonmail_enabled: true,
    dkim_selector: 'vaway',
    dkim_public_key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3fGz9d+2b7e1Xv0vL8V4YfB7r8a3rWqY8k...',
    comment: 'Primary corporate email domain',
    created_at: '2025-01-15',
  },
  {
    name: 'vaway.com',
    max_users: -1, // unlimited
    max_aliases: -1,
    max_quota_bytes: 0, // unlimited
    signup_enabled: true,
    anonmail_enabled: true,
    dkim_selector: 'vaway',
    dkim_public_key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu3Z9d1+k7Xv...p42=',
    comment: 'VAWAY Enterprise Root Domain',
    created_at: '2025-02-01',
  },
];

export const initialAlternatives: Alternative[] = [
  {
    name: 'example.org',
    domain_name: 'example.com',
    created_at: '2025-01-16',
  },
];

export const initialUsers: User[] = [
  {
    email: 'admin@example.com',
    localpart: 'admin',
    domain_name: 'example.com',
    displayed_name: 'Postmaster Admin',
    quota_bytes: 10 * 1024 * 1024 * 1024, // 10 GB
    quota_used_bytes: 1.2 * 1024 * 1024 * 1024,
    global_admin: true,
    enabled: true,
    enable_imap: true,
    enable_pop: true,
    spam_enabled: true,
    spam_mark_as_read: false,
    spam_threshold: 80,
    auto_reply_enabled: false,
    auto_reply_subject: '',
    auto_reply_body: '',
    forward_enabled: false,
    forward_destination: [],
    forward_keep: true,
    created_at: '2025-01-15',
    comment: 'Default superuser postmaster',
  },
  {
    email: 'alice@example.com',
    localpart: 'alice',
    domain_name: 'example.com',
    displayed_name: 'Alice Johnson',
    quota_bytes: 5 * 1024 * 1024 * 1024, // 5 GB
    quota_used_bytes: 840 * 1024 * 1024, // 840 MB
    global_admin: false,
    enabled: true,
    enable_imap: true,
    enable_pop: true,
    spam_enabled: true,
    spam_mark_as_read: true,
    spam_threshold: 85,
    auto_reply_enabled: true,
    auto_reply_subject: 'Out of Office: On Vacation',
    auto_reply_body: 'Hello, thank you for reaching out. I am currently out of the office with limited email access. I will review your message upon my return.',
    auto_reply_start: '2026-09-01',
    auto_reply_end: '2026-09-10',
    forward_enabled: false,
    forward_destination: [],
    forward_keep: true,
    created_at: '2025-01-18',
    comment: 'Operations Lead',
  },
  {
    email: 'bob@example.com',
    localpart: 'bob',
    domain_name: 'example.com',
    displayed_name: 'Bob Miller',
    quota_bytes: 2 * 1024 * 1024 * 1024, // 2 GB
    quota_used_bytes: 320 * 1024 * 1024, // 320 MB
    global_admin: false,
    enabled: true,
    enable_imap: true,
    enable_pop: false,
    spam_enabled: true,
    spam_mark_as_read: false,
    spam_threshold: 80,
    auto_reply_enabled: false,
    auto_reply_subject: '',
    auto_reply_body: '',
    forward_enabled: true,
    forward_destination: ['bob.backup@external-mail.net'],
    forward_keep: true,
    created_at: '2025-02-02',
    comment: 'Engineering Staff',
  },
  {
    email: 'support@vaway.com',
    localpart: 'support',
    domain_name: 'vaway.com',
    displayed_name: 'VAWAY Support Desk',
    quota_bytes: 20 * 1024 * 1024 * 1024, // 20 GB
    quota_used_bytes: 4.8 * 1024 * 1024 * 1024,
    global_admin: false,
    enabled: true,
    enable_imap: true,
    enable_pop: true,
    spam_enabled: true,
    spam_mark_as_read: false,
    spam_threshold: 75,
    auto_reply_enabled: false,
    auto_reply_subject: '',
    auto_reply_body: '',
    forward_enabled: false,
    forward_destination: [],
    forward_keep: true,
    created_at: '2025-02-05',
    comment: 'Shared customer support inbox',
  },
];

export const initialAliases: Alias[] = [
  {
    email: 'contact@example.com',
    localpart: 'contact',
    domain_name: 'example.com',
    destination: ['admin@example.com', 'alice@example.com'],
    wildcard: false,
    created_at: '2025-01-20',
    comment: 'General contact routing',
  },
  {
    email: 'sales@example.com',
    localpart: 'sales',
    domain_name: 'example.com',
    destination: ['alice@example.com'],
    wildcard: false,
    created_at: '2025-01-22',
    comment: 'Sales inquiries',
  },
  {
    email: 'hello@vaway.com',
    localpart: 'hello',
    domain_name: 'vaway.com',
    destination: ['support@vaway.com'],
    wildcard: false,
    created_at: '2025-02-06',
    comment: 'Friendly greeting alias',
  },
];

export const initialAnonymousAliases: AnonymousAlias[] = [
  {
    id: 'anon-1',
    email: 'anon.8x29f1@example.com',
    target_user: 'alice@example.com',
    domain_name: 'example.com',
    description: 'Shopping registration (Privacy alias)',
    received_count: 14,
    forwarded_count: 14,
    blocked_count: 0,
    enabled: true,
    created_at: '2025-03-01',
  },
  {
    id: 'anon-2',
    email: 'anon.q49k2a@example.com',
    target_user: 'bob@example.com',
    domain_name: 'example.com',
    description: 'Newsletter subscription',
    received_count: 28,
    forwarded_count: 28,
    blocked_count: 2,
    enabled: true,
    created_at: '2025-03-10',
  },
];

export const initialRelays: Relay[] = [
  {
    name: 'partnercorp.net',
    smtp: 'smtp-relay.partnercorp.net:25',
    comment: 'Outbound trusted relay partner',
    created_at: '2025-02-12',
  },
];

export const initialTokens: Token[] = [
  {
    id: 'tok-1',
    token: 'vwy_live_839fd847b2c94982a17ef04d2e8b',
    user_email: 'admin@example.com',
    ip: '192.168.1.0/24',
    comment: 'CI/CD Provisioning Script',
    created_at: '2025-02-15',
  },
  {
    id: 'tok-2',
    token: 'vwy_live_67c13a529e81b045f82d49c63b19',
    user_email: 'admin@example.com',
    ip: '',
    comment: 'Grafana Monitoring Metrics Agent',
    created_at: '2025-03-01',
  },
];

export const initialServices: ServiceStatus[] = [
  {
    name: 'Front Nginx',
    service: 'nginx',
    port: '80, 443, 25, 465, 587, 143, 993, 110, 995',
    status: 'running',
    version: '1.24.0',
    description: 'HTTP reverse proxy, TLS termination, and mail auth proxy',
  },
  {
    name: 'Postfix SMTP',
    service: 'postfix',
    port: 25,
    status: 'running',
    version: '3.8.4',
    description: 'MTA mail transfer agent, queue manager, and relay',
  },
  {
    name: 'Dovecot IMAP/POP',
    service: 'dovecot',
    port: '143, 993, 110, 995, 4190',
    status: 'running',
    version: '2.3.21',
    description: 'IMAP & POP3 mail store, ManageSieve, user authentication',
  },
  {
    name: 'Rspamd Antispam',
    service: 'rspamd',
    port: 11334,
    status: 'running',
    version: '3.8.1',
    description: 'Spam filter, DKIM signing, ARC, DMARC validation, Bayes filter',
  },
  {
    name: 'ClamAV Antivirus',
    service: 'clamav',
    port: 3310,
    status: 'running',
    version: '1.2.1',
    description: 'Signature-based malware and Trojan scanner',
  },
  {
    name: 'Radicale WebDAV',
    service: 'radicale',
    port: 5232,
    status: 'running',
    version: '3.1.8',
    description: 'CalDAV and CardDAV synchronization service',
  },
  {
    name: 'Roundcube Webmail',
    service: 'webmail',
    port: 80,
    status: 'running',
    version: '1.6.6',
    description: 'Modern AJAX webmail client interface',
  },
];

export const initialEmails: SimulatedEmail[] = [
  {
    id: 'msg-1',
    from: 'postmaster@example.com',
    to: 'admin@example.com',
    subject: 'Welcome to your VAWAY Mail Server',
    body: `Welcome to VAWAY Mail Server!

Your self-hosted enterprise mail server is fully operational.
Here is your quick startup summary:
- SMTP, IMAP, and POP3 ports are active
- DKIM selector is active and public keys are ready
- Let's Encrypt TLS certificate status: OK
- Antispam and Antivirus filtering: ENABLED

You can manage all domains, mailboxes, aliases, and DNS records directly from this administration interface.`,
    date: '2026-09-04 10:15',
    folder: 'inbox',
    read: true,
    spamScore: 0.1,
    dkimStatus: 'pass',
    spfStatus: 'pass',
  },
  {
    id: 'msg-2',
    from: 'security-alerts@example.com',
    to: 'admin@example.com',
    subject: 'Weekly DMARC & TLS Aggregate Report',
    body: `Aggregate DMARC Verification Report:
- Total messages evaluated: 1,420
- SPF Alignment: 99.4% Pass
- DKIM Alignment: 99.8% Pass
- Rejected spoofing attempts: 18 messages blocked

All authentication policies adhere to RFC 7489 standard.`,
    date: '2026-09-04 14:22',
    folder: 'inbox',
    read: false,
    spamScore: 0.2,
    dkimStatus: 'pass',
    spfStatus: 'pass',
  },
  {
    id: 'msg-3',
    from: 'lottery-winner@suspicious-domain-fake.org',
    to: 'admin@example.com',
    subject: 'URGENT: Claim your $5,000,000 cash prize immediately!',
    body: `Congratulations! You have been chosen as the Grand Prize Winner of the International Fund Sweepstakes.
Please reply with your bank routing details, password, and social security number immediately.`,
    date: '2026-09-04 09:02',
    folder: 'spam',
    read: false,
    spamScore: 14.8,
    dkimStatus: 'fail',
    spfStatus: 'softfail',
  },
  {
    id: 'msg-4',
    from: 'admin@example.com',
    to: 'alice@example.com',
    subject: 'Quarterly Server Maintenance Notice',
    body: `Hi Alice,

Please be advised that we will be performing standard updates to the Dovecot storage engine this Sunday at 02:00 UTC.
Expected downtime will be under 60 seconds.

Best regards,
VAWAY Admin Team`,
    date: '2026-09-03 16:40',
    folder: 'sent',
    read: true,
    spamScore: 0.0,
    dkimStatus: 'pass',
    spfStatus: 'pass',
  },
];
