
import React, { useState, useEffect } from 'react';
import { AppView, User } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [user, setUser] = useState<User | null>(null);

  // Mock login check
  useEffect(() => {
    const savedUser = localStorage.getItem('whb_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView(AppView.DASHBOARD);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('whb_user', JSON.stringify(userData));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('whb_user');
    setCurrentView(AppView.AUTH);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.AUTH:
        return <Auth onLogin={handleLogin} />;
      case AppView.DASHBOARD:
        return <Dashboard user={user} />;
      case AppView.SETTINGS:
        return <Settings user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-100 selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] pointer-events-none rounded-full" />

      <main className="flex-grow flex flex-col relative z-10">
        {renderView()}
      </main>

      {currentView !== AppView.AUTH && (
        <Navigation currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
};

export default App;
