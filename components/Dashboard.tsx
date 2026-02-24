
import React, { useState, useEffect } from 'react';
import { PromptHistoryItem, PromptOptions, User } from '../types';
import ImageUploader from './ImageUploader';
import { generateImagePrompt } from "@/types";

const DAILY_LIMIT = 30;
const AD_INTERVAL = 5;
const REWARD_AMOUNT = 5;

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  
  // Daily Usage State
  const [generationsLeft, setGenerationsLeft] = useState<number>(DAILY_LIMIT);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Interstitial Ad State
  const [genCountSinceAd, setGenCountSinceAd] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [canCloseAd, setCanCloseAd] = useState(false);

  // Rewarded Ad State
  const [showRewardAdModal, setShowRewardAdModal] = useState(false);
  const [rewardCountdown, setRewardCountdown] = useState(5);
  const [isRewardUnlocked, setIsRewardUnlocked] = useState(false);

  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Prompt Configuration State
  const [options, setOptions] = useState<PromptOptions>({
    midjourneyFormat: true,
    stableDiffusionFormat: false,
    negativePrompt: false,
    styleTags: true,
    colorPalette: false,
    lightingBreakdown: true
  });

  // Handle usage limit initialization and reset logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const savedUsage = localStorage.getItem('whb_usage_stats');
    
    if (savedUsage) {
      const { count, lastReset } = JSON.parse(savedUsage);
      if (lastReset === today) {
        setGenerationsLeft(count);
      } else {
        setGenerationsLeft(DAILY_LIMIT);
        localStorage.setItem('whb_usage_stats', JSON.stringify({ count: DAILY_LIMIT, lastReset: today }));
      }
    } else {
      localStorage.setItem('whb_usage_stats', JSON.stringify({ count: DAILY_LIMIT, lastReset: today }));
    }
  }, []);

  // Interstitial Ad Progress Timer
  useEffect(() => {
    let interval: number;
    if (showAdModal) {
      setAdProgress(0);
      setCanCloseAd(false);
      const startTime = Date.now();
      const duration = 3000;

      interval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setAdProgress(progress);
        if (progress >= 100) {
          setCanCloseAd(true);
          clearInterval(interval);
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [showAdModal]);

  // Rewarded Ad Timer
  useEffect(() => {
    let timer: number;
    if (showRewardAdModal && rewardCountdown > 0) {
      timer = window.setInterval(() => {
        setRewardCountdown(prev => {
          if (prev <= 1) {
            setIsRewardUnlocked(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showRewardAdModal, rewardCountdown]);

  // Update localStorage whenever generationsLeft changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('whb_usage_stats', JSON.stringify({ count: generationsLeft, lastReset: today }));
  }, [generationsLeft]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('whb_prompt_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('whb_prompt_history', JSON.stringify(history));
  }, [history]);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const toggleOption = (key: keyof PromptOptions) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleGenerate = async () => {
    const isPro = !!user?.isPro;

    // Standard users check limit
    if (!isPro && generationsLeft <= 0) {
      setShowLimitModal(true);
      return;
    }
    if (!uploadedImage) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = await generateImagePrompt(uploadedImage, options);
      setGeneratedPrompt(prompt);
      
      // Update usage limit only for non-Pro users
      if (!isPro) {
        const nextCount = generationsLeft - 1;
        setGenerationsLeft(nextCount);
        
        const newAdCount = genCountSinceAd + 1;
        setGenCountSinceAd(newAdCount);

        if (newAdCount >= AD_INTERVAL) {
          setGenCountSinceAd(0);
          setTimeout(() => setShowAdModal(true), 800);
        } else if (nextCount === 0) {
          setTimeout(() => setShowLimitModal(true), 1500);
        }
      }

      const newItem: PromptHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: uploadedImage,
        prompt: prompt,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartRewardAd = () => {
    if (user?.isPro) return; // Pro users don't need rewards
    setShowLimitModal(false);
    setRewardCountdown(5);
    setIsRewardUnlocked(false);
    setShowRewardAdModal(true);
  };

  const handleClaimReward = () => {
    setGenerationsLeft(prev => prev + REWARD_AMOUNT);
    setShowRewardAdModal(false);
    showToast(`+${REWARD_AMOUNT} Units Loaded`);
  };

  const handleRefinement = async () => {
  setIsAssistantOpen(false);
  showToast("Refiner coming soon");
};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Sequence Copied");
  };

  const exportAsTxt = (text: string, id: string = 'current') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WHB_Prompt_${id}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("File Exported");
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast("Entry Deleted");
  };

  const reset = () => {
    setUploadedImage(null);
    setGeneratedPrompt(null);
    setError(null);
    setIsAssistantOpen(false);
  };

  const isLimitReached = !user?.isPro && generationsLeft <= 0;

  return (
    <div className="flex-grow flex flex-col p-6 pb-32 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Toast Notification */}
      <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-6 scale-90'}`}>
        <div className="glass-dark px-8 py-3 rounded-full border border-indigo-500/40 flex items-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
          <div className="w-2 h-2 rounded-full bg-indigo-500 glow-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white">{toast.message}</span>
        </div>
      </div>

      {/* Usage Limit Counter - Hidden or Infinity for Pro */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={() => isLimitReached && setShowLimitModal(true)}
          className={`px-5 py-2 rounded-full border transition-all duration-500 flex items-center gap-3 cursor-default ${
            user?.isPro ? 'bg-amber-500/10 border-amber-500/30' : 
            isLimitReached ? 'bg-red-500/10 border-red-500/30 cursor-pointer active:scale-95' : 
            'bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${user?.isPro ? 'bg-amber-500 glow-pulse' : isLimitReached ? 'bg-red-500' : 'bg-indigo-500 glow-pulse'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${user?.isPro ? 'text-amber-400' : isLimitReached ? 'text-red-400' : 'text-indigo-300'}`}>
            {user?.isPro ? 'Infinite Synthesis Active' : `Generations left today: ${generationsLeft}`}
          </span>
        </button>
      </div>

      <header className="mb-14 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-600/5 blur-[80px] pointer-events-none"></div>
        <h2 className="text-5xl font-black tracking-tighter mb-2 gradient-text">SYNTHESIS</h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Neural Mapping Core</p>
      </header>

      {error && (
        <div className="mb-8 p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {!generatedPrompt ? (
        <div className="space-y-12">
          <div className="relative">
            <ImageUploader onImageSelected={setUploadedImage} currentImage={uploadedImage} />
            {isGenerating && (
              <div className="absolute inset-0 z-20 rounded-[2.5rem] overflow-hidden pointer-events-none bg-indigo-900/10 backdrop-blur-[4px] animate-in fade-in duration-500">
                <div className="scanning-line"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-6">
                      <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Analyzing DNA</span>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-indigo-500/[0.01] group-hover:bg-indigo-500/[0.03] transition-colors duration-1000"></div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-1.5 h-7 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Parameter Matrix</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-5 relative z-10">
              <ToggleSwitch label="MJ 6.1 Mode" active={options.midjourneyFormat} onClick={() => toggleOption('midjourneyFormat')} />
              <ToggleSwitch label="SDXL Engine" active={options.stableDiffusionFormat} onClick={() => toggleOption('stableDiffusionFormat')} />
              <ToggleSwitch label="Excl. Negative" active={options.negativePrompt} onClick={() => toggleOption('negativePrompt')} />
              <ToggleSwitch label="Style Vectors" active={options.styleTags} onClick={() => toggleOption('styleTags')} />
              <ToggleSwitch label="Color Profile" active={options.colorPalette} onClick={() => toggleOption('colorPalette')} />
              <ToggleSwitch label="Atmospherics" active={options.lightingBreakdown} onClick={() => toggleOption('lightingBreakdown')} />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className={`w-full py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] transition-all flex items-center justify-center gap-5 shadow-2xl relative overflow-hidden group border-t border-white/10 ${
              (!uploadedImage) ? 'bg-white/5 text-gray-700 cursor-not-allowed border-white/5 opacity-50' : 
              isLimitReached ? 'bg-red-500/10 text-red-400 border-red-500/20 active:scale-[0.98]' :
              isGenerating ? 'bg-indigo-600/10 text-indigo-400 cursor-wait border-indigo-500/20' : 
              'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-indigo-600/40'
            }`}
          >
            {isGenerating ? <>Synthesizing...</> : isLimitReached ? <>Limit Depleted</> : <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-12 transition-transform"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Commence Mapping
            </>}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="flex flex-col gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-[3rem] blur opacity-40 group-hover:opacity-80 transition duration-1000"></div>
              <div className="relative bg-[#060606] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="px-10 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_#6366f1]"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-200">Synthesized Link</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-700 tracking-tighter">PROTO_V3.1</div>
                </div>

                <div className="p-10">
                  <div className="bg-black/80 rounded-3xl p-8 border border-white/5 min-h-[200px] group/textarea relative shadow-inner">
                    <div className="text-[15px] text-gray-300 leading-relaxed font-medium mono whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
                      {isRefining ? <span className="animate-pulse opacity-50">Neural pathways shifting...</span> : generatedPrompt}
                    </div>
                    
                    {!isRefining && (
                      <button 
                        onClick={() => setIsAssistantOpen(true)}
                        className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 p-3 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group/refine"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white group-hover/refine:rotate-90 transition-transform"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-10 pb-10 flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden shrink-0 shadow-2xl">
                      <img src={uploadedImage!} className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700" alt="Reference" />
                   </div>
                   <div className="flex-grow">
                      <div className="h-[2px] w-12 bg-indigo-600/60 mb-3"></div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Source Reference</p>
                      <p className="text-[11px] text-gray-400 font-mono truncate opacity-60">Neural_Profile_Extracted_S01</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 grid grid-cols-2 gap-5">
                <button
                  onClick={() => copyToClipboard(generatedPrompt!)}
                  className="relative overflow-hidden font-black py-7 rounded-[2rem] flex items-center justify-center gap-5 transition-all uppercase tracking-[0.25em] text-[11px] border border-indigo-500/30 bg-indigo-600/10 text-white hover:bg-indigo-600/20 shadow-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy Text
                </button>
                <button
                  onClick={() => exportAsTxt(generatedPrompt!)}
                  className="relative overflow-hidden font-black py-7 rounded-[2rem] flex items-center justify-center gap-5 transition-all uppercase tracking-[0.25em] text-[11px] border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Export .TXT
                </button>
              </div>
              <button
                onClick={reset}
                className="col-span-2 bg-white text-black font-black py-7 rounded-[2rem] flex items-center justify-center gap-5 transition-all uppercase tracking-[0.25em] text-[11px] hover:bg-gray-200 active:scale-[0.98] shadow-2xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                New Sequence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded Ad Modal */}
      {!user?.isPro && (
        <div className={`fixed inset-0 z-[130] flex items-center justify-center p-6 transition-all duration-500 ${showRewardAdModal ? 'bg-black/98 backdrop-blur-3xl opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className={`w-full max-w-sm glass-dark rounded-[3rem] p-10 border border-indigo-500/30 shadow-[0_0_120px_rgba(99,102,241,0.3)] transition-all duration-700 transform ${showRewardAdModal ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>
            <div className="flex flex-col items-center text-center">
                <div className="w-full flex justify-between items-center mb-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Neural Surge Reward</span>
                  <div className="px-4 py-1.5 rounded-full border border-white/10 text-[9px] font-mono text-gray-500">SECURE_SYNC</div>
                </div>

                <div className="aspect-video w-full rounded-2xl bg-black border border-white/5 relative overflow-hidden group mb-10">
                  <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 bg-indigo-500/40 rounded-full animate-bounce`} 
                          style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}
                        />
                      ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                      <div className="flex items-center gap-4 w-full">
                        <div className="p-2 rounded-full bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"/><path d="M16 19h6"/><path d="M19 16v6"/></svg>
                        </div>
                        <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                              style={{ width: `${((5 - rewardCountdown) / 5) * 100}%` }}
                            />
                        </div>
                      </div>
                  </div>
                </div>

                <div className="mb-10">
                  {isRewardUnlocked ? (
                    <div className="animate-in zoom-in duration-500">
                        <h4 className="text-2xl font-black tracking-tight text-white mb-2">Reward Unlocked</h4>
                        <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase">+5 Generations Available</p>
                    </div>
                  ) : (
                    <div>
                        <h4 className="text-xl font-black tracking-tight text-gray-400 mb-2">Analyzing Feed</h4>
                        <div className="text-3xl font-mono text-white glow-pulse">{rewardCountdown}s</div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleClaimReward}
                  disabled={!isRewardUnlocked}
                  className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all ${
                    isRewardUnlocked 
                      ? 'bg-white text-black hover:bg-gray-200 shadow-2xl shadow-white/10 active:scale-95' 
                      : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {isRewardUnlocked ? 'Claim Synthesis Units' : 'Wait for Decryption...'}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Interstitial Ad Modal */}
      {!user?.isPro && (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-6 transition-all duration-500 ${showAdModal ? 'bg-black/95 backdrop-blur-2xl opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className={`w-full max-w-sm glass-dark rounded-[3rem] p-10 border border-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.2)] transition-all duration-700 transform ${showAdModal ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-full flex justify-between items-center mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Sponsored Content</span>
                <button 
                  onClick={() => canCloseAd && setShowAdModal(false)}
                  disabled={!canCloseAd}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${canCloseAd ? 'border-white/10 text-white hover:bg-white/5 active:scale-90' : 'border-white/5 text-gray-800 cursor-not-allowed'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
                <div className="relative flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-indigo-500/10 animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <h4 className="text-sm font-black tracking-widest text-indigo-200">NEURAL INTERFACE V2</h4>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Latency reduced by 80%</p>
                </div>
              </div>
              
              <div className="w-full space-y-4">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-100 ease-linear shadow-[0_0_15px_#6366f1]" 
                      style={{ width: `${adProgress}%` }}
                    />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                  {canCloseAd ? 'Ready for Extraction' : 'Stabilizing Stream...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Limit Reached Modal */}
      {!user?.isPro && (
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-6 transition-all duration-500 ${showLimitModal ? 'bg-black/90 backdrop-blur-xl opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className={`w-full max-w-sm glass-dark rounded-[3rem] p-10 border border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.15)] transition-all duration-700 transform ${showLimitModal ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" className="relative"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              
              <h3 className="text-2xl font-black tracking-tight text-white mb-3">Daily Limit Reached</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-10 px-4">
                You used all <span className="text-white font-bold">30</span> free generations today. Upgrade your neural link for infinite synthesis.
              </p>

              <div className="w-full space-y-4">
                <button 
                  onClick={handleStartRewardAd}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-gray-200 transition-all active:scale-[0.98]"
                >
                  Get More Generations
                </button>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-5 rounded-2xl border border-white/5 hover:bg-white/[0.03] text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] transition-all"
                >
                  Come Back Tomorrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Neural Refiner Assistant Panel */}
      <div className={`fixed inset-0 z-[60] flex items-end justify-center px-6 pb-6 transition-all duration-700 ${isAssistantOpen ? 'bg-black/80 backdrop-blur-md opacity-100' : 'pointer-events-none opacity-0'}`}>
         <div className={`w-full max-w-lg bg-[#080808] border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(99,102,241,0.2)] transition-all duration-700 transform ${isAssistantOpen ? 'translate-y-0 scale-100' : 'translate-y-full scale-90'}`}>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-pulse"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight gradient-text">NEURAL REFINER</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">AI Prompt Assistant v1.0</p>
                  </div>
               </div>
               <button onClick={() => setIsAssistantOpen(false)} className="text-gray-600 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">Instruction the assistant on how to modify the DNA. Example: <span className="text-indigo-400 italic">"Add dark gothic armor"</span> or <span className="text-indigo-400 italic">"Shift style to Studio Ghibli"</span>.</p>

            <div className="relative mb-8">
               <textarea 
                 value={instruction}
                 onChange={(e) => setInstruction(e.target.value)}
                 placeholder="Type refinement code..."
                 className="w-full h-32 bg-black border border-white/5 rounded-3xl p-6 text-sm outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all font-mono"
               />
            </div>

            <button 
              onClick={handleRefinement}
              disabled={!instruction.trim() || isRefining}
              className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 transition-all ${
                !instruction.trim() ? 'bg-white/5 text-gray-700 cursor-not-allowed' :
                isRefining ? 'bg-indigo-600/10 text-indigo-400' :
                'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 active:scale-[0.98]'
              }`}
            >
              {isRefining ? 'Re-Processing...' : 'Apply Evolution'}
            </button>
         </div>
      </div>

      {history.length > 0 && (
        <div className="mt-28 animate-in fade-in duration-1000">
          <div className="flex items-center gap-6 mb-10">
             <div className="h-[1px] flex-grow bg-white/5"></div>
             <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.6em] whitespace-nowrap">Archives</h3>
             <div className="h-[1px] flex-grow bg-white/5"></div>
          </div>
          <div className="space-y-5">
            {history.map(item => (
              <div key={item.id} className="glass rounded-[2rem] p-5 flex gap-6 items-center border border-white/5 hover:border-indigo-500/40 transition-all duration-700 group cursor-default relative overflow-hidden shadow-sm hover:shadow-indigo-500/5">
                <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-white/10 ring-4 ring-white/[0.01]">
                   <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100" alt="History" />
                </div>
                <div className="flex-grow min-w-0 pr-16">
                  <p className="text-[11px] text-gray-500 truncate font-mono leading-relaxed mb-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    {item.prompt.substring(0, 85)}...
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] text-indigo-400 uppercase tracking-[0.25em] font-black px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10">STABLE</span>
                    <span className="text-[9px] text-gray-700 uppercase tracking-[0.25em] font-black">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="absolute right-5 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0">
                  <button onClick={() => copyToClipboard(item.prompt)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border border-white/5 bg-black/40 backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                  <button onClick={() => exportAsTxt(item.prompt, item.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-all border border-white/5 bg-black/40 backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  </button>
                  <button onClick={() => deleteFromHistory(item.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5 bg-black/40 backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => { if (confirm("Terminate all archives?")) { setHistory([]); showToast("Archive Purged"); } }} 
            className="mt-12 w-full text-[10px] text-gray-800 hover:text-red-500 uppercase tracking-[0.4em] transition-colors font-black text-center"
          >
            Purge Core Database
          </button>
        </div>
      )}
    </div>
  );
};

interface ToggleProps { label: string; active: boolean; onClick: () => void; }
const ToggleSwitch: React.FC<ToggleProps> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center justify-between p-5 rounded-[1.75rem] border transition-all duration-700 relative overflow-hidden group/toggle ${active ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100 shadow-[0_0_25px_rgba(99,102,241,0.15)]' : 'bg-white/[0.01] border-white/5 text-gray-600 hover:border-white/10 hover:bg-white/[0.03]'}`}>
    {active && <div className="absolute inset-0 shimmer opacity-20"></div>}
    <span className="text-[10px] font-black uppercase tracking-[0.25em] truncate relative z-10 group-hover/toggle:text-white transition-colors">{label}</span>
    <div className={`w-3 h-3 rounded-full transition-all duration-700 relative z-10 ${active ? 'bg-indigo-500 shadow-[0_0_15px_#6366f1] scale-110' : 'bg-gray-900 scale-75'}`}></div>
  </button>
);

export default Dashboard;
