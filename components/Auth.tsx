
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated auth
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email || 'guest@whb.ai',
      name: name || email.split('@')[0] || 'Neural Architect',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email || 'guest'}`,
      isPro: false // Standard tier by default
    };
    onLogin(mockUser);
  };

  const handleGuest = () => {
    const guestUser: User = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      email: 'guest@whb.ai',
      name: 'Guest Explorer',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      isPro: false // Guest is standard tier
    };
    onLogin(guestUser);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6 min-h-screen relative overflow-hidden">
      {/* Ambient light effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 mb-6 shadow-2xl relative group">
             <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 relative"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-3 gradient-text">WHB PROMPTS</h1>
          <div className="h-[1px] w-12 bg-indigo-500/30 mx-auto mb-3"></div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Neural Character Synthesis</p>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Identity Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Neural_Alpha"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-gray-800 text-sm font-medium"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Neural Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@network.ai"
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-gray-800 text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Access Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-gray-800 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl mt-4 shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 group"
            >
              {isLogin ? 'Initialize Session' : 'Create DNA Profile'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
            <button
              onClick={handleGuest}
              className="w-full py-4 rounded-2xl border border-white/5 hover:bg-white/[0.03] text-gray-400 font-bold uppercase tracking-[0.15em] text-[9px] transition-all flex items-center justify-center gap-3 group/guest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover/guest:text-indigo-400 transition-colors"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Continue as Guest
            </button>
          </div>
        </div>

        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            {isLogin ? "No DNA record found?" : "Existing profile detected?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
            >
              {isLogin ? 'Register Now' : 'Sync Session'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
