import React from 'react';
import { Trophy, Sparkles, Award } from 'lucide-react';

interface TrophyHeroProps {
  totalVotes: number;
  totalCategories: number;
}

export const TrophyHero: React.FC<TrophyHeroProps> = ({ totalVotes, totalCategories }) => {
  return (
    <section className="relative pt-12 pb-8 text-center space-y-6">
      {/* Decorative top ribbon */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vma-mint/10 border border-vma-mint/30 text-vma-mint font-mono text-xs font-bold uppercase tracking-widest shadow-vma-mint animate-pulse">
        <Sparkles className="w-3.5 h-3.5" />
        <span>OFFICIAL WINNERS CEREMONY // CLASS OF '26</span>
      </div>

      {/* Main Title */}
      <div className="space-y-2 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-7xl font-heading font-black tracking-tight uppercase text-white leading-none">
          THE CHAMPIONS OF <span className="text-vma-mint">STAN TWITTER</span>
        </h1>
        <p className="text-xs sm:text-sm text-chrome-400 font-mono tracking-wide max-w-xl mx-auto">
          One Timeline. Every Fandom. The votes have been counted, verified, and sealed. Celebrate the official 2026 trophy winners below!
        </p>
      </div>

      {/* Stats Counter Bar */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
        <div className="p-4 rounded-2xl bg-vma-cardDark border border-white/10 text-center">
          <div className="text-2xl sm:text-3xl font-heading font-black text-vma-mint">
            {totalVotes.toLocaleString()}+
          </div>
          <div className="text-[10px] font-mono uppercase text-chrome-400 tracking-wider">
            Total Votes Cast
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-vma-cardDark border border-white/10 text-center">
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {totalCategories}
          </div>
          <div className="text-[10px] font-mono uppercase text-chrome-400 tracking-wider">
            Official Categories
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-vma-cardDark border border-white/10 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl sm:text-3xl font-heading font-black text-amber-400 flex items-center justify-center gap-1.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>10</span>
          </div>
          <div className="text-[10px] font-mono uppercase text-chrome-400 tracking-wider">
            Trophies Crowned
          </div>
        </div>
      </div>
    </section>
  );
};
