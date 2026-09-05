import React, { useState } from 'react';
import { VawayMailProvider } from './context/VawayMailContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DomainsView } from './components/DomainsView';
import { UsersView } from './components/UsersView';
import { AliasesView } from './components/AliasesView';
import { RelaysView } from './components/RelaysView';
import { AdminsView } from './components/AdminsView';
import { TokensView } from './components/TokensView';
import { ClientSetupView } from './components/ClientSetupView';
import { WebmailView } from './components/WebmailView';
import { SetupWizardView } from './components/SetupWizardView';

const viewTitles: Record<ViewType, string> = {
  inbox: 'Inbox',
  starred: 'Starred',
  snoozed: 'Snoozed',
  sent: 'Sent',
  drafts: 'Drafts',
  priority: 'Priority Task',
  spam: 'Spam / Junk',
  trash: 'Trash',
  dashboard: 'System Overview & Health',
  domains: 'Mail Domains',
  users: 'Mailboxes & Users',
  aliases: 'Aliases & Anonmail',
  relays: 'Relayed Domains',
  admins: 'Administrators',
  tokens: 'API Authentication Tokens',
  'client-setup': 'Client Configuration Guide',
  webmail: 'Webmail & Mailbox',
  'config-wizard': 'Configuration Generator',
};

const MainContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('inbox');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');

  const isMailFolder = [
    'inbox',
    'starred',
    'snoozed',
    'sent',
    'drafts',
    'priority',
    'spam',
    'trash',
    'webmail',
  ].includes(activeView);

  const handleOpenCompose = (recipient?: string) => {
    setComposeRecipient(recipient || '');
    setIsComposeOpen(true);
  };

  const handleCloseCompose = () => {
    setIsComposeOpen(false);
    setComposeRecipient('');
  };

  const renderActiveView = () => {
    if (isMailFolder) {
      return (
        <WebmailView
          initialFolder={activeView === 'webmail' ? 'inbox' : activeView}
          searchTerm={searchTerm}
          isComposeOpen={isComposeOpen}
          composeRecipient={composeRecipient}
          onCloseCompose={handleCloseCompose}
          onOpenCompose={handleOpenCompose}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={(view) => setActiveView(view)} />;
      case 'domains':
        return <DomainsView />;
      case 'users':
        return <UsersView onNavigate={(view) => setActiveView(view)} />;
      case 'aliases':
        return <AliasesView />;
      case 'relays':
        return <RelaysView />;
      case 'admins':
        return <AdminsView />;
      case 'tokens':
        return <TokensView />;
      case 'client-setup':
        return <ClientSetupView />;
      case 'config-wizard':
        return <SetupWizardView />;
      default:
        return (
          <WebmailView
            initialFolder="inbox"
            searchTerm={searchTerm}
            isComposeOpen={isComposeOpen}
            composeRecipient={composeRecipient}
            onCloseCompose={handleCloseCompose}
            onOpenCompose={handleOpenCompose}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#202124] flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeViewTitle={viewTitles[activeView] || 'Inbox'}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenSettings={() => setActiveView('config-wizard')}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => setActiveView(view)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenCompose={handleOpenCompose}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-2 sm:p-3 overflow-y-auto max-w-[1700px] w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <VawayMailProvider>
      <MainContent />
    </VawayMailProvider>
  );
}

export default App;
