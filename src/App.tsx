import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Search,
  Flame,
  LayoutGrid,
  Crown,
  Share2,
  X,
  PartyPopper,
  Radio,
  Lock,
  ArrowRight,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CategoryWinnerResult } from './types';
import { CategoryStage } from './components/CategoryStage';
import { HallOfFame } from './components/HallOfFame';
import { LivePremiereBroadcast } from './components/LivePremiereBroadcast';
import { CountdownStage } from './components/CountdownStage';
import { LiveChatReactions } from './components/LiveChatReactions';
import { AdminPanel } from './components/AdminPanel';
import { getCeremonyState, setCeremonyMode, CeremonyState } from './lib/premiereState';
import { songPlayer } from './lib/songPlayer';
import defaultWinnersData from './data/winnersData.json';

const SUPABASE_API_URL = 'https://noir-stan-awards.vercel.app/api/winners';

export default function App() {
  // Route check: /admin or #admin
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=true')
    );
  });

  const [results, setResults] = useState<CategoryWinnerResult[]>(defaultWinnersData as CategoryWinnerResult[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ceremony, setCeremony] = useState<CeremonyState>(() => getCeremonyState());

  // Navigation State for Full Winners Mode
  const [activeTab, setActiveTab] = useState<'all' | 'hall-of-fame'>('all');
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => songPlayer.getIsPlaying());

  useEffect(() => {
    const handleSongState = () => {
      setIsMusicPlaying(songPlayer.getIsPlaying());
    };
    window.addEventListener('song_player_state_changed', handleSongState);
    return () => {
      window.removeEventListener('song_player_state_changed', handleSongState);
    };
  }, []);

  // Listen to popstate / hashchange for admin route
  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminRoute(
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true')
      );
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Listen for Ceremony state updates across tabs & events
  useEffect(() => {
    const handleCeremonyUpdate = () => {
      setCeremony(getCeremonyState());
    };

    window.addEventListener('ceremony_state_changed', handleCeremonyUpdate);
    window.addEventListener('storage', handleCeremonyUpdate);

    return () => {
      window.removeEventListener('ceremony_state_changed', handleCeremonyUpdate);
      window.removeEventListener('storage', handleCeremonyUpdate);
    };
  }, []);

  // Fetch Supabase data if live
  const fetchWinners = async () => {
    try {
      const res = await fetch(SUPABASE_API_URL, { cache: 'no-store' });
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        setResults(data.results);
      }
    } catch {
      // Offline fallback
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 150,
        spread: 110,
        origin: { y: 0.6 },
        colors: ['#facc15', '#f43f5e', '#7bf1a8', '#ffffff', '#e11d48', '#38bdf8'],
      });
    } catch {}
  };

  useEffect(() => {
    fetchWinners();
    triggerConfetti();
  }, []);

  const handleShareCeremony = () => {
    const text = `🏆 The NOIR STAN AWARDS '26 Official Ceremony is LIVE! Check out every category's crowned Winner, Top Contenders, and official award cards! 🌟 #NoirStanAwards #OneTimelineEveryFandom`;
    const shareUrl = 'https://noir-stan-awards-winners.netlify.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  // If viewing admin route, render AdminPanel directly
  if (isAdminRoute) {
    return <AdminPanel />;
  }

  // Filter categories by search
  const filteredCategories = results
    .map((cat) => {
      if (!searchQuery.trim()) return cat;
      const q = searchQuery.toLowerCase().trim();
      const catMatches = cat.category_title.toLowerCase().includes(q);
      const filteredNominees = cat.nominees.filter(
        (n) => n.display_name.toLowerCase().includes(q) || n.x_username.toLowerCase().includes(q)
      );

      if (catMatches) return cat;
      if (filteredNominees.length > 0) {
        return { ...cat, nominees: filteredNominees };
      }
      return null;
    })
    .filter(Boolean) as CategoryWinnerResult[];

  return (
    <div className="min-h-screen text-white font-mono flex flex-col justify-between selection:bg-amber-400 selection:text-noir-950 relative overflow-x-hidden bg-black">
      {/* User's Red Carpet Background Image */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: `url('/user-background.webp')` }}
        />
        {/* Subtle dark tint to ensure white & gold text are 100% sharp and readable */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content Area Sitting Directly on the Red Carpet */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 w-full">
        {/* Top Broadcast Bar (Clean Floating, No Grey Card Box) */}
        <header className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-400/30 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-amber-600 p-0.5 shadow-vma-gold shrink-0">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-amber-300">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight uppercase text-white block leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                NOIR STAN AWARDS <span className="text-vma-gold">'26</span>
              </span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input (Only shown when full results are unlocked or in ended mode with full view) */}
            {ceremony.mode === 'ended' && ceremony.unlockFullResults && (
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-chrome-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search nominee or @handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-black/60 border border-white/25 text-white placeholder-chrome-400 text-xs font-mono focus:outline-none focus:border-amber-400 transition-colors backdrop-blur-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-chrome-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Ceremony Music Toggle */}
            <button
              onClick={() => songPlayer.toggle()}
              className={`px-3.5 py-2 rounded-full border text-xs font-mono uppercase flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-md ${
                isMusicPlaying
                  ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-vma-gold'
                  : 'bg-black/60 hover:bg-black/90 border-amber-400/40 text-amber-300'
              }`}
              title={isMusicPlaying ? 'Pause Ceremony Song (song.mp3)' : 'Play Ceremony Song (song.mp3)'}
            >
              {isMusicPlaying ? (
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-black" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">{isMusicPlaying ? 'Song: ON' : 'Song: OFF'}</span>
            </button>

            {/* Confetti Blast Button */}
            <button
              onClick={triggerConfetti}
              className="px-3.5 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 font-heading font-black text-xs uppercase flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-md backdrop-blur-md"
              title="Pop red carpet celebration confetti"
            >
              <PartyPopper className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Celebrate</span>
            </button>

            {/* Share Broadcast Button */}
            <button
              onClick={handleShareCeremony}
              className="px-3.5 py-2 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-heading font-black text-xs uppercase flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-md"
              title="Share ceremony to Twitter"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tweet</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            CEREMONY PRESENTATION STAGE (BASED ON REAL-TIME MODE)
            ========================================================================= */}
        <main className="space-y-12">
          {ceremony.mode === 'countdown' ? (
            /* =========================================================================
               MODE 1: COUNTDOWN TO 5:30 PM IST
               ========================================================================= */
            <CountdownStage
              targetIso={ceremony.countdownTarget}
              onCountdownComplete={() => setCeremonyMode('live')}
            />
          ) : ceremony.mode === 'live' ? (
            /* =========================================================================
               MODE 2: SYNCHRONIZED LIVE PREMIERE BROADCAST (10s PER CATEGORY)
               ========================================================================= */
            <LivePremiereBroadcast
              categories={results}
              onFinishPremiere={() => setCeremonyMode('ended')}
            />
          ) : !ceremony.unlockFullResults ? (
            /* =========================================================================
               MODE 3A: EVENT ENDED (LOCKED - ADMIN HAS NOT UNLOCKED FULL WINNERS YET)
               Per user: "if not allowed in the admin then it should just say the premier ended"
               ========================================================================= */
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 relative z-30 animate-fade-in max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-amber-500 p-1 shadow-vma-gold animate-bounce">
                <div className="w-full h-full bg-black rounded-[20px] flex items-center justify-center text-amber-300">
                  <Trophy className="w-10 h-10" />
                </div>
              </div>

              <div className="space-y-3">
                <span className="px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/60 text-red-300 font-mono text-xs font-bold uppercase tracking-widest inline-block">
                  ★ BROADCAST CONCLUDED ★
                </span>
                <h1 className="text-4xl sm:text-6xl font-heading font-black uppercase text-white tracking-tight drop-shadow-[0_4px_25px_rgba(0,0,0,1)]">
                  THE PREMIERE HAS ENDED
                </h1>
                <p className="text-sm sm:text-base text-amber-100 font-mono leading-relaxed">
                  The live ceremony broadcast for the Noir Stan Awards '26 has officially wrapped up! Thank you to everyone who tuned in and voted.
                </p>
                <div className="p-4 rounded-2xl bg-black/80 border border-amber-400/40 text-xs text-chrome-300 font-mono max-w-md mx-auto">
                  <p>
                    Official certified category cards, vote percentage breakdowns, and full winner leaderboards will be unlocked shortly. Stay tuned!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleShareCeremony}
                  className="px-6 py-3 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-heading font-black text-xs uppercase flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Final Results on Twitter</span>
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               MODE 3B: FULL WINNERS & CARDS UNLOCKED (ADMIN ALLOWED FULL RESULTS)
               Per user: "if i access to show the whole voting winner on then it would show the winners pages"
               ========================================================================= */
            <div className="space-y-12">
              {/* Tab Selector: All Categories vs Hall of Fame */}
              <div className="flex items-center justify-center gap-2 border-b border-amber-400/20 pb-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-5 py-2 rounded-full font-heading font-black text-xs uppercase transition-all ${
                    activeTab === 'all'
                      ? 'bg-amber-400 text-black shadow-vma-gold'
                      : 'bg-black/60 text-chrome-300 hover:text-white border border-white/10'
                  }`}
                >
                  All 12 Category Stages
                </button>
                <button
                  onClick={() => setActiveTab('hall-of-fame')}
                  className={`px-5 py-2 rounded-full font-heading font-black text-xs uppercase transition-all ${
                    activeTab === 'hall-of-fame'
                      ? 'bg-amber-400 text-black shadow-vma-gold'
                      : 'bg-black/60 text-chrome-300 hover:text-white border border-white/10'
                  }`}
                >
                  👑 Golden Hall of Fame
                </button>
              </div>

              {activeTab === 'hall-of-fame' ? (
                <HallOfFame
                  categories={results}
                  onSelectCategory={() => setActiveTab('all')}
                />
              ) : (
                <section className="space-y-14">
                  {filteredCategories.map((category) => (
                    <CategoryStage key={category.category_id} category={category} />
                  ))}
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Ceremonial Gala Footer */}
      <footer className="relative z-20 border-t border-amber-400/30 mt-20 py-10 px-4 text-center space-y-3 bg-black/75 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span className="font-heading font-black text-2xl uppercase tracking-tight text-white drop-shadow">
            NOIR STAN AWARDS <span className="text-vma-gold">'26</span>
          </span>
        </div>
        <p className="text-xs text-chrome-300 font-mono max-w-xl mx-auto leading-relaxed drop-shadow">
          ONE TIMELINE. EVERY FANDOM. Official Red Carpet Ceremony & Certified Results.
        </p>
        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-chrome-400">
          <button
            onClick={triggerConfetti}
            className="text-amber-300 hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Celebrate</span>
          </button>
          <span>•</span>
          <a
            href="#admin"
            onClick={() => setIsAdminRoute(true)}
            className="text-chrome-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-amber-400/70" />
            <span>Admin Control Room</span>
          </a>
        </div>
      </footer>

      {/* Floating Live Reaction Emojis & Live Chat Drawer (Active in all modes) */}
      <LiveChatReactions
        isBroadcasting={ceremony.mode === 'live'}
      />
    </div>
  );
}
