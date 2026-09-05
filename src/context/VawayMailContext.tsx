import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Domain,
  User,
  Alias,
  AnonymousAlias,
  Alternative,
  Relay,
  Token,
  ServiceStatus,
  SimulatedEmail,
  VawayMailConfig,
} from '../types';
import {
  initialConfig,
  initialDomains,
  initialAlternatives,
  initialUsers,
  initialAliases,
  initialAnonymousAliases,
  initialRelays,
  initialTokens,
  initialServices,
  initialEmails,
} from '../data/initialData';

interface DnsRecord {
  type: 'MX' | 'TXT' | 'CNAME' | 'SRV' | 'TLSA';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  description: string;
}

export interface VawayMailContextType {
  config: VawayMailConfig;
  updateConfig: (cfg: Partial<VawayMailConfig>) => void;
  domains: Domain[];
  addDomain: (d: Omit<Domain, 'created_at' | 'dkim_selector' | 'dkim_public_key'>) => void;
  updateDomain: (name: string, updates: Partial<Domain>) => void;
  deleteDomain: (name: string) => void;
  regenerateDkim: (domainName: string) => void;
  getDomainDnsRecords: (domainName: string) => DnsRecord[];
  
  users: User[];
  addUser: (u: Partial<User> & { email: string; domain_name: string }) => boolean;
  updateUser: (email: string, updates: Partial<User>) => void;
  deleteUser: (email: string) => void;
  
  aliases: Alias[];
  addAlias: (a: Omit<Alias, 'created_at'>) => boolean;
  updateAlias: (email: string, updates: Partial<Alias>) => void;
  deleteAlias: (email: string) => void;

  anonAliases: AnonymousAlias[];
  addAnonAlias: (targetUser: string, domainName: string, description: string) => void;
  toggleAnonAlias: (id: string) => void;
  deleteAnonAlias: (id: string) => void;

  alternatives: Alternative[];
  addAlternative: (name: string, domainName: string) => void;
  deleteAlternative: (name: string) => void;

  relays: Relay[];
  addRelay: (name: string, smtp: string, comment?: string) => void;
  deleteRelay: (name: string) => void;

  tokens: Token[];
  addToken: (userEmail: string, comment?: string, expiresInDays?: number, ip?: string) => string;
  revokeToken: (id: string) => void;
  deleteToken: (id: string) => void;

  services: ServiceStatus[];
  restartService: (serviceName: string) => void;

  emails: SimulatedEmail[];
  currentAccount: string;
  setCurrentAccount: (email: string) => void;
  sendEmail: (fromOrTo: string, toOrSubject: string, subjectOrBody: string, bodyOptional?: string) => void;
  markEmailAsRead: (id: string) => void;
  markEmailRead: (id: string) => void;
  markSpam: (id: string, isSpam: boolean) => void;
  deleteEmail: (id: string) => void;
  resetAllData: () => void;
}

const VawayMailContext = createContext<VawayMailContextType | undefined>(undefined);

const STORAGE_PREFIX = 'vaway_mail_v1_';

export const VawayMailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<VawayMailConfig>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'config');
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [domains, setDomains] = useState<Domain[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'domains');
    return saved ? JSON.parse(saved) : initialDomains;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [aliases, setAliases] = useState<Alias[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'aliases');
    return saved ? JSON.parse(saved) : initialAliases;
  });

  const [anonAliases, setAnonAliases] = useState<AnonymousAlias[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'anon_aliases');
    return saved ? JSON.parse(saved) : initialAnonymousAliases;
  });

  const [alternatives, setAlternatives] = useState<Alternative[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'alternatives');
    return saved ? JSON.parse(saved) : initialAlternatives;
  });

  const [relays, setRelays] = useState<Relay[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'relays');
    return saved ? JSON.parse(saved) : initialRelays;
  });

  const [tokens, setTokens] = useState<Token[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'tokens');
    return saved ? JSON.parse(saved) : initialTokens;
  });

  const [services, setServices] = useState<ServiceStatus[]>(() => initialServices);

  const [emails, setEmails] = useState<SimulatedEmail[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'emails');
    return saved ? JSON.parse(saved) : initialEmails;
  });

  const [currentAccount, setCurrentAccount] = useState<string>('admin@example.com');

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'domains', JSON.stringify(domains));
  }, [domains]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'aliases', JSON.stringify(aliases));
  }, [aliases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'anon_aliases', JSON.stringify(anonAliases));
  }, [anonAliases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'alternatives', JSON.stringify(alternatives));
  }, [alternatives]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'relays', JSON.stringify(relays));
  }, [relays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'tokens', JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'emails', JSON.stringify(emails));
  }, [emails]);

  const updateConfig = (cfg: Partial<VawayMailConfig>) => {
    setConfig((prev) => ({ ...prev, ...cfg }));
  };

  const addDomain = (d: Omit<Domain, 'created_at' | 'dkim_selector' | 'dkim_public_key'>) => {
    const newDomain: Domain = {
      ...d,
      name: d.name.toLowerCase().trim(),
      dkim_selector: 'vaway',
      dkim_public_key: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 10)}=`,
      created_at: new Date().toISOString().split('T')[0],
    };
    setDomains((prev) => [...prev, newDomain]);
  };

  const updateDomain = (name: string, updates: Partial<Domain>) => {
    setDomains((prev) =>
      prev.map((d) => (d.name.toLowerCase() === name.toLowerCase() ? { ...d, ...updates } : d))
    );
  };

  const deleteDomain = (name: string) => {
    const target = name.toLowerCase();
    setDomains((prev) => prev.filter((d) => d.name.toLowerCase() !== target));
    setUsers((prev) => prev.filter((u) => u.domain_name.toLowerCase() !== target));
    setAliases((prev) => prev.filter((a) => a.domain_name.toLowerCase() !== target));
    setAnonAliases((prev) => prev.filter((a) => a.domain_name.toLowerCase() !== target));
    setAlternatives((prev) => prev.filter((a) => a.domain_name.toLowerCase() !== target));
  };

  const regenerateDkim = (domainName: string) => {
    const newKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${Math.random().toString(36).substring(2, 15)}R${Math.random().toString(36).substring(2, 10)}=`;
    updateDomain(domainName, { dkim_public_key: newKey });
  };

  const getDomainDnsRecords = (domainName: string): DnsRecord[] => {
    const d = domains.find((dom) => dom.name.toLowerCase() === domainName.toLowerCase());
    const host = config.hostname;
    const records: DnsRecord[] = [
      {
        type: 'MX',
        name: '@',
        value: `10 ${host}.`,
        ttl: 600,
        priority: 10,
        description: 'Mail Exchanger - routes inbound emails to VAWAY server',
      },
      {
        type: 'TXT',
        name: '@',
        value: `v=spf1 mx a:${host} ~all`,
        ttl: 600,
        description: 'Sender Policy Framework - authorizes VAWAY server IP to send mail',
      },
      {
        type: 'TXT',
        name: `${d?.dkim_selector || 'vaway'}._domainkey`,
        value: `v=DKIM1; k=rsa; p=${d?.dkim_public_key || 'MIIBIjANBgkq...'};`,
        ttl: 600,
        description: 'DomainKeys Identified Mail - cryptographic signature verification',
      },
      {
        type: 'TXT',
        name: `_dmarc`,
        value: `v=DMARC1; p=reject; rua=mailto:${config.postmaster}@${config.domain}; adkim=s; aspf=s`,
        ttl: 600,
        description: 'DMARC Policy - instructs receiving servers to reject spoofed email',
      },
      {
        type: 'CNAME',
        name: `autoconfig`,
        value: `${host}.`,
        ttl: 600,
        description: 'RFC 6186 client auto-configuration endpoint (Thunderbird / Thunderbird mobile)',
      },
      {
        type: 'CNAME',
        name: `autodiscover`,
        value: `${host}.`,
        ttl: 600,
        description: 'Microsoft Outlook autodiscover endpoint',
      },
      {
        type: 'SRV',
        name: `_submission._tcp`,
        value: `20 1 587 ${host}.`,
        ttl: 600,
        description: 'Mail submission port SRV record for automated mail clients',
      },
      {
        type: 'SRV',
        name: `_imaps._tcp`,
        value: `10 1 993 ${host}.`,
        ttl: 600,
        description: 'Secure IMAP port SRV record for client discovery',
      },
    ];

    if (config.tls_flavor.includes('letsencrypt')) {
      records.push({
        type: 'TLSA',
        name: `_25._tcp.${host}`,
        value: `2 1 1 0b9fa5a59eed715c26c1020c711b4f6ec42d58b0015e14337a39dad301c5afc3`,
        ttl: 86400,
        description: 'DANE TLSA certificate pin for SMTP opportunistic encryption',
      });
    }

    return records;
  };

  const addUser = (u: Partial<User> & { email: string; domain_name: string }): boolean => {
    const normalizedEmail = u.email.toLowerCase().trim();
    if (users.some((x) => x.email.toLowerCase() === normalizedEmail)) {
      return false;
    }
    const [localpart] = normalizedEmail.split('@');
    const newUser: User = {
      email: normalizedEmail,
      localpart: localpart || '',
      domain_name: u.domain_name.toLowerCase(),
      displayed_name: u.displayed_name || localpart,
      quota_bytes: u.quota_bytes ?? 2 * 1024 * 1024 * 1024,
      quota_used_bytes: 0,
      global_admin: !!u.global_admin,
      enabled: u.enabled !== false,
      enable_imap: u.enable_imap !== false,
      enable_pop: u.enable_pop !== false,
      spam_enabled: u.spam_enabled !== false,
      spam_mark_as_read: !!u.spam_mark_as_read,
      spam_threshold: u.spam_threshold ?? 80,
      auto_reply_enabled: !!u.auto_reply_enabled,
      auto_reply_subject: u.auto_reply_subject || '',
      auto_reply_body: u.auto_reply_body || '',
      auto_reply_start: u.auto_reply_start,
      auto_reply_end: u.auto_reply_end,
      forward_enabled: !!u.forward_enabled,
      forward_destination: u.forward_destination || [],
      forward_keep: u.forward_keep !== false,
      created_at: new Date().toISOString().split('T')[0],
      comment: u.comment || '',
    };
    setUsers((prev) => [...prev, newUser]);
    return true;
  };

  const updateUser = (email: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...updates } : u))
    );
  };

  const deleteUser = (email: string) => {
    const target = email.toLowerCase();
    setUsers((prev) => prev.filter((u) => u.email.toLowerCase() !== target));
    setAnonAliases((prev) => prev.filter((a) => a.target_user.toLowerCase() !== target));
  };

  const addAlias = (a: Omit<Alias, 'created_at'>): boolean => {
    const normalizedEmail = a.email.toLowerCase().trim();
    if (aliases.some((x) => x.email.toLowerCase() === normalizedEmail)) {
      return false;
    }
    const newAlias: Alias = {
      ...a,
      email: normalizedEmail,
      localpart: a.localpart.toLowerCase(),
      domain_name: a.domain_name.toLowerCase(),
      destination: a.destination.map((d) => d.toLowerCase().trim()),
      created_at: new Date().toISOString().split('T')[0],
    };
    setAliases((prev) => [...prev, newAlias]);
    return true;
  };

  const updateAlias = (email: string, updates: Partial<Alias>) => {
    setAliases((prev) =>
      prev.map((a) => (a.email.toLowerCase() === email.toLowerCase() ? { ...a, ...updates } : a))
    );
  };

  const deleteAlias = (email: string) => {
    setAliases((prev) => prev.filter((a) => a.email.toLowerCase() !== email.toLowerCase()));
  };

  const addAnonAlias = (targetUser: string, domainName: string, description: string) => {
    const randomHex = Math.random().toString(36).substring(2, 8);
    const email = `anon.${randomHex}@${domainName.toLowerCase()}`;
    const newAnon: AnonymousAlias = {
      id: 'anon-' + Date.now(),
      email,
      target_user: targetUser.toLowerCase(),
      domain_name: domainName.toLowerCase(),
      description: description || 'Generated Privacy Alias',
      received_count: 0,
      forwarded_count: 0,
      blocked_count: 0,
      enabled: true,
      created_at: new Date().toISOString().split('T')[0],
    };
    setAnonAliases((prev) => [newAnon, ...prev]);
  };

  const toggleAnonAlias = (id: string) => {
    setAnonAliases((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deleteAnonAlias = (id: string) => {
    setAnonAliases((prev) => prev.filter((a) => a.id !== id));
  };

  const addAlternative = (name: string, domainName: string) => {
    const alt: Alternative = {
      name: name.toLowerCase().trim(),
      domain_name: domainName.toLowerCase(),
      created_at: new Date().toISOString().split('T')[0],
    };
    setAlternatives((prev) => [...prev, alt]);
  };

  const deleteAlternative = (name: string) => {
    setAlternatives((prev) => prev.filter((a) => a.name.toLowerCase() !== name.toLowerCase()));
  };

  const addRelay = (name: string, smtp: string, comment?: string) => {
    const r: Relay = {
      name: name.toLowerCase().trim(),
      smtp: smtp.trim(),
      comment: comment || '',
      created_at: new Date().toISOString().split('T')[0],
    };
    setRelays((prev) => [...prev, r]);
  };

  const deleteRelay = (name: string) => {
    setRelays((prev) => prev.filter((r) => r.name.toLowerCase() !== name.toLowerCase()));
  };

  const addToken = (userEmail: string, comment?: string, expiresInDays?: number, ip?: string): string => {
    const rawToken = 'mlu_live_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + (expiresInDays || 90));

    const t: Token = {
      id: 'tok-' + Date.now(),
      token: rawToken,
      user_email: userEmail.toLowerCase(),
      ip: ip || '',
      comment: comment || 'Generated API Token',
      created_at: now.toISOString().split('T')[0],
      expires_at: expiryDate.toISOString().split('T')[0],
    };
    setTokens((prev) => [t, ...prev]);
    return rawToken;
  };

  const revokeToken = (id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

  const restartService = (serviceName: string) => {
    setServices((prev) =>
      prev.map((s) => (s.service === serviceName ? { ...s, status: 'stopped' } : s))
    );
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => (s.service === serviceName ? { ...s, status: 'running' } : s))
      );
    }, 900);
  };

  const sendEmail = (fromOrTo: string, toOrSubject: string, subjectOrBody: string, bodyOptional?: string) => {
    let sender = currentAccount;
    let recipient = fromOrTo;
    let subject = toOrSubject;
    let body = subjectOrBody;

    if (bodyOptional !== undefined) {
      sender = fromOrTo;
      recipient = toOrSubject;
      subject = subjectOrBody;
      body = bodyOptional;
    }

    const normalizedTo = recipient.toLowerCase().trim();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Sent folder entry
    const sentMsg: SimulatedEmail = {
      id: 'msg-' + Date.now(),
      from: sender,
      to: normalizedTo,
      subject,
      body,
      date: now,
      folder: 'sent',
      read: true,
      spamScore: 0.1,
      dkimStatus: 'pass',
      spfStatus: 'pass',
    };

    // 2. Determine recipient destination(s)
    const targetUser = users.find((u) => u.email.toLowerCase() === normalizedTo);
    const targetAlias = aliases.find((a) => a.email.toLowerCase() === normalizedTo);
    const targetAnon = anonAliases.find((a) => a.email.toLowerCase() === normalizedTo);

    const deliveredRecipients: string[] = [];
    if (targetUser) {
      deliveredRecipients.push(targetUser.email);
    } else if (targetAlias) {
      deliveredRecipients.push(...targetAlias.destination);
    } else if (targetAnon && targetAnon.enabled) {
      deliveredRecipients.push(targetAnon.target_user);
      // update hit counter
      setAnonAliases((prev) =>
        prev.map((a) =>
          a.id === targetAnon.id
            ? { ...a, received_count: a.received_count + 1, forwarded_count: a.forwarded_count + 1 }
            : a
        )
      );
    } else {
      // Local delivery or external simulation
      deliveredRecipients.push(normalizedTo);
    }

    const newInboundMsgs: SimulatedEmail[] = [];

    // Deliver to inboxes
    deliveredRecipients.forEach((rcpt, idx) => {
      newInboundMsgs.push({
        id: 'msg-' + (Date.now() + idx + 1),
        from: sender,
        to: rcpt,
        subject,
        body,
        date: now,
        folder: 'inbox',
        read: false,
        spamScore: 0.1,
        dkimStatus: 'pass',
        spfStatus: 'pass',
      });

      // Check auto-reply for this user
      const recipientUser = users.find((u) => u.email.toLowerCase() === rcpt.toLowerCase());
      if (recipientUser && recipientUser.auto_reply_enabled && recipientUser.auto_reply_body) {
        // Queue automatic vacation response
        setTimeout(() => {
          setEmails((cur) => [
            {
              id: 'reply-' + Date.now(),
              from: recipientUser.email,
              to: sender,
              subject: recipientUser.auto_reply_subject || `Re: ${subject} (Auto-Reply)`,
              body: recipientUser.auto_reply_body,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              folder: 'inbox',
              read: false,
              spamScore: 0.0,
              dkimStatus: 'pass',
              spfStatus: 'pass',
            },
            ...cur,
          ]);
        }, 1200);
      }

      // Check forwarding rule
      if (recipientUser && recipientUser.forward_enabled && recipientUser.forward_destination.length > 0) {
        recipientUser.forward_destination.forEach((fwd, fIdx) => {
          newInboundMsgs.push({
            id: 'fwd-' + (Date.now() + 10 + fIdx),
            from: sender,
            to: fwd,
            subject: `[Fwd] ${subject}`,
            body: `(Forwarded automatically by VAWAY)\n\n${body}`,
            date: now,
            folder: 'inbox',
            read: false,
            spamScore: 0.1,
            dkimStatus: 'pass',
            spfStatus: 'pass',
          });
        });
      }
    });

    setEmails((prev) => [sentMsg, ...newInboundMsgs, ...prev]);
  };

  const markEmailAsRead = (id: string) => {
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    );
  };

  const markSpam = (id: string, isSpam: boolean) => {
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            folder: (isSpam ? 'spam' : 'inbox') as SimulatedEmail['folder'],
            spamScore: isSpam ? 95 : 0.1,
          };
        }
        return m;
      })
    );
  };

  const deleteEmail = (id: string) => {
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return m.folder === 'trash' ? null : { ...m, folder: 'trash' as const };
        }
        return m;
      }).filter(Boolean) as SimulatedEmail[]
    );
  };

  const resetAllData = () => {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
    setConfig(initialConfig);
    setDomains(initialDomains);
    setUsers(initialUsers);
    setAliases(initialAliases);
    setAnonAliases(initialAnonymousAliases);
    setAlternatives(initialAlternatives);
    setRelays(initialRelays);
    setTokens(initialTokens);
    setServices(initialServices);
    setEmails(initialEmails);
    setCurrentAccount('admin@example.com');
  };

  return (
    <VawayMailContext.Provider
      value={{
        config,
        updateConfig,
        domains,
        addDomain,
        updateDomain,
        deleteDomain,
        regenerateDkim,
        getDomainDnsRecords,
        users,
        addUser,
        updateUser,
        deleteUser,
        aliases,
        addAlias,
        updateAlias,
        deleteAlias,
        anonAliases,
        addAnonAlias,
        toggleAnonAlias,
        deleteAnonAlias,
        alternatives,
        addAlternative,
        deleteAlternative,
        relays,
        addRelay,
        deleteRelay,
        tokens,
        addToken,
        revokeToken,
        deleteToken: revokeToken,
        services,
        restartService,
        emails,
        currentAccount,
        setCurrentAccount,
        sendEmail,
        markEmailAsRead,
        markEmailRead: markEmailAsRead,
        markSpam,
        deleteEmail,
        resetAllData,
      }}
    >
      {children}
    </VawayMailContext.Provider>
  );
};

export const useVawayMail = () => {
  const ctx = useContext(VawayMailContext);
  if (!ctx) {
    throw new Error('useVawayMail must be used within a VawayMailProvider');
  }
  return ctx;
};
