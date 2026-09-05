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
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
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
      case 'webmail':
        return <WebmailView />;
      case 'config-wizard':
        return <SetupWizardView />;
      default:
        return <DashboardView onNavigate={(view) => setActiveView(view)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeViewTitle={viewTitles[activeView]}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
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
