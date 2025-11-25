



import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BrandsPage } from './components/pages/BrandsPage';
// FIX: Corrected import path for HomePage
import { HomePage } from './components/pages/HomePage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { DashboardsPage } from './components/pages/DashboardsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { MobileHeader } from './components/MobileHeader';
// FIX: Corrected import path for types
import type { View, User, Report } from './types';
import { api } from './api';


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [navigationState, setNavigationState] = useState<{ report?: Report } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.get<User>('users/me');
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleNavigate = (view: View, payload?: { report: Report }) => {
    setActiveView(view);
    setNavigationState(payload || null);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'Home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'Brands':
        return <BrandsPage />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Reports':
        return <DashboardsPage initialReport={navigationState?.report} />;
      case 'Settings':
        return <SettingsPage user={user} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar 
        activeView={activeView} 
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={user}
      />
      <div className="flex flex-col flex-1 w-full">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-6 pt-20 md:pt-8 lg:pt-12">
          {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden" />}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;