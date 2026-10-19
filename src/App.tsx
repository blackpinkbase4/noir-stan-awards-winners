import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Filter, RefreshCw, Award } from 'lucide-react';
import { CategoryWinnerResult } from './types';
import { TrophyHero } from './components/TrophyHero';
import { WinnerCard } from './components/WinnerCard';
import defaultWinnersData from './data/winnersData.json';

// Default Supabase Endpoint or Fallback
const SUPABASE_API_URL = 'https://noir-stan-awards.vercel.app/api/winners';

export default function App() {
  const [results, setResults] = useState<CategoryWinnerResult[]>(defaultWinnersData as CategoryWinnerResult[]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchWinners = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(SUPABASE_API_URL, { cache: 'no-store' });
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        setResults(data.results);
      }
    } catch (err) {
      // Gracefully uses bundled snapshot if offline
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWinners();

    // Trigger celebration confetti cannon on open
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7bf1a8', '#facc15', '#ffffff', '#38bdf8'],
      });
    } catch {}
  }, []);

  const totalVotes = results.reduce((sum, c) => sum + (c.total_votes || 0), 0);

  const filteredCategories = results.filter((cat) => {
    if (filter === 'all') return true;
    if (filter === 'fanbase') return cat.category_id.includes('fanbase') || cat.category_id.includes('update') || cat.category_id.includes('streaming');
    if (filter === 'creators') return cat.category_id.includes('editor') || cat.category_id.includes('designer');
    if (filter === 'culture') return cat.category_id.includes('iconic') || cat.category_id.includes('khia') || cat.category_id.includes('funniest') || cat.category_id.includes('choice');
    return true;
  });

  return (
    <div className="min-h-screen bg-noir-950 text-white font-mono flex flex-col justify-between selection:bg-vma-mint selection:text-noir-950 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-vma-mint/5 rounded-full blur-[140px]" />
        <div className="absolute top-[600px] left-1/4 w-[500px] h-[300px] bg-amber-400/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Top Navbar */}
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vma-mint/20 border border-vma-mint/50 flex items-center justify-center text-vma-mint shadow-vma-mint">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-tight uppercase text-white block">
                NOIR STAN AWARDS <span className="text-vma-mint">'26</span>
              </span>
              <span className="text-[10px] text-chrome-400 font-mono tracking-widest uppercase block">
                OFFICIAL WINNERS PODIUM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchWinners(true)}
              disabled={refreshing}
              className="px-3.5 py-1.5 rounded-xl bg-noir-900 border border-white/10 hover:border-vma-mint text-xs text-chrome-300 flex items-center gap-1.5 transition-all"
              title="Refresh results"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-vma-mint' : ''}`} />
              <span className="hidden sm:inline">Live Sync</span>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <TrophyHero totalVotes={totalVotes} totalCategories={results.length || 10} />

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'all', label: 'All 10 Categories' },
            { id: 'fanbase', label: 'Fanbases & Updates' },
            { id: 'creators', label: 'Editors & Artists' },
            { id: 'culture', label: 'Culture & Stan Icon' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === item.id
                  ? 'bg-vma-mint text-noir-950 border-vma-mint shadow-vma-mint'
                  : 'bg-vma-cardDark border-white/10 text-chrome-400 hover:text-white hover:border-white/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-vma-mint border-t-transparent animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-chrome-400">
              Unlocking Official Trophy Standings...
            </p>
          </div>
        ) : (
          /* Winners Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            {filteredCategories.map((cat) => (
              <WinnerCard key={cat.category_id} category={cat} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-8 px-4 text-center space-y-2">
        <div className="font-heading font-black text-lg uppercase tracking-tight text-white">
          NOIR STAN AWARDS <span className="text-vma-mint">'26</span>
        </div>
        <p className="text-xs text-chrome-500 font-mono">
          ONE TIMELINE. EVERY FANDOM. Congratulations to all creators, fanbases, and champions!
        </p>
      </footer>
    </div>
  );
}
