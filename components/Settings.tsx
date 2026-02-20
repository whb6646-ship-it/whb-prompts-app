
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState<'midjourney' | 'stable-diffusion'>('midjourney');
  const [autoCopy, setAutoCopy] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  // Synchronize theme with HTML class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Hidden logic to toggle Pro status for testing
  const handleAvatarClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 5) {
      if (user) {
        const updatedUser = { ...user, isPro: !user.isPro };
        localStorage.setItem('whb_user', JSON.stringify(updatedUser));
        // Force a page reload to refresh user state across app
        window.location.reload();
      }
      setClickCount(0);
    }
  };

  return (
    <div className="flex-grow flex flex-col p-6 pb-24 max-w-2xl mx-auto w-full animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">System <span className="text-indigo-500">Config</span></h2>
        <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-medium">User Preferences & Global Params</p>
      </header>

      <div className="space-y-8">
        {/* Profile Header */}
        <section className="relative group">
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${user?.isPro ? 'from-amber-500/40 to-orange-500/40' : 'from-indigo-500/20 to-blue-500/20'} rounded-3xl blur opacity-30 transition-all duration-1000`}></div>
          <div className="relative glass rounded-3xl p-6 border-white/5 flex items-center gap-5">
            <div 
              onClick={handleAvatarClick}
              className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${user?.isPro ? 'border-amber-500/50' : 'border-indigo-500/30'} ring-4 ${user?.isPro ? 'ring-amber-500/10' : 'ring-indigo-500/5'} shadow-2xl cursor-pointer active:scale-90 transition-all`}
            >
              <img src={user?.avatar || 'https://picsum.photos/seed/user/200'} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg tracking-tight">{user?.name || 'Authorized User'}</h3>
                {user?.isPro && (
                  <span className="bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">PRO</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mono uppercase tracking-widest">{user?.email || 'dna_synths_01@whb.ai'}</p>
            </div>
          </div>
        </section>

        {/* Subscription Info (Prepared for Monetization) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className={`w-1 h-3 ${user?.isPro ? 'bg-amber-500' : 'bg-indigo-500'} rounded-full`}></div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Neural Link Tier</h4>
          </div>
          <div className="glass rounded-[2rem] p-6 border-white/5 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-tight">{user?.isPro ? 'Infinite Synthesis' : 'Standard Core'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                {user?.isPro ? 'Full neural throughput active' : 'Daily processing limits applied'}
              </p>
            </div>
            {/* hidden upgrade button placeholder */}
            {!user?.isPro && (
              <div className="opacity-0 pointer-events-none">
                <button className="px-4 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Upgrade</button>
              </div>
            )}
          </div>
        </section>

        {/* Interface Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Interface</h4>
          </div>
          
          <div className="glass rounded-[2rem] divide-y divide-white/5 overflow-hidden border-white/5 shadow-xl">
            {/* Theme Toggle */}
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-tight">App Aesthetic</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">{isDarkMode ? 'Dark Protocol' : 'Light Protocol'}</p>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-14 h-7 rounded-full transition-all duration-500 flex items-center px-1 ${isDarkMode ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-500 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Auto-Copy Toggle */}
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-tight">Auto-Extract Copy</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Instant Clipboard Sync</p>
              </div>
              <button 
                onClick={() => setAutoCopy(!autoCopy)}
                className={`w-14 h-7 rounded-full transition-all duration-500 flex items-center px-1 ${autoCopy ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-500 ${autoCopy ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Synthesis Config */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synthesis Engine</h4>
          </div>
          
          <div className="glass rounded-[2rem] p-5 border-white/5 shadow-xl">
             <p className="text-sm font-semibold tracking-tight mb-4">Default Model Format</p>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDefaultFormat('midjourney')}
                  className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    defaultFormat === 'midjourney' 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  Midjourney
                </button>
                <button 
                  onClick={() => setDefaultFormat('stable-diffusion')}
                  className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    defaultFormat === 'stable-diffusion' 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  SDXL / Forge
                </button>
             </div>
          </div>
        </section>

        {/* App Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Application Info</h4>
          </div>
          <div className="glass rounded-[2rem] p-6 border-white/5 shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Core Version</span>
              <span className="text-gray-200 mono font-bold">1.2.4-stable</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Neural Engine</span>
              <span className="text-indigo-400 mono font-bold">Gemini 3.0 Flash</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">API Latency</span>
              <span className="text-green-500 mono font-bold">~420ms</span>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-600 text-center uppercase tracking-[0.4em] font-black">WHB Prompts &copy; 2025</p>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-6">
           <button 
            onClick={onLogout}
            className="w-full py-5 rounded-[1.5rem] bg-red-500/5 hover:bg-red-500/10 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-red-500/10 active:scale-[0.98]"
          >
            Terminate Session
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
