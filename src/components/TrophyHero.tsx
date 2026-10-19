import React from 'react';
import { Trophy, Sparkles, Award, Camera, Crown } from 'lucide-react';

interface TrophyHeroProps {
  totalVotes: number;
  totalCategories: number;
  totalNominees: number;
}

export const TrophyHero: React.FC<TrophyHeroProps> = ({ totalVotes, totalCategories, totalNominees }) => {
  return (
    <section className="relative pt-4 pb-8 text-center overflow-hidden">
      {/* Red Carpet Ribbon Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-amber-400/60 text-amber-300 font-mono text-xs font-bold uppercase tracking-widest shadow-vma-gold backdrop-blur-md">
        <Camera className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>RED CARPET CEREMONY // FINAL CERTIFIED HONORS</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </div>

      {/* Main Dramatic Headline Sitting Directly on the Red Carpet Stage */}
      <div className="space-y-2 max-w-4xl mx-auto mt-4">
        <h1 className="text-4xl sm:text-7xl lg:text-8xl font-heading font-black tracking-tight uppercase text-white leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,1)]">
          THE <span className="text-vma-gold">MAIN STAGE</span> CEREMONY
        </h1>
        <p className="text-xs sm:text-sm text-chrome-200 font-mono tracking-wide max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
          Step onto the red carpet. Every vote has been locked and audited. Meet every category's crowned Winner, Top 2, Top 3, and full timeline rankings.
        </p>
      </div>

      {/* Stats Counter Bar — STRAIGHT ON RED CARPET, ZERO GREY BOXES */}
      <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 mt-6 pt-2">
        <div className="text-center drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
          <div className="text-3xl sm:text-5xl font-heading font-black text-amber-300">
            {totalVotes.toLocaleString()}
          </div>
          <div className="text-[11px] sm:text-xs font-mono uppercase text-white/90 font-bold tracking-wider mt-0.5">
            Fan Votes Cast
          </div>
        </div>

        <div className="text-center drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
          <div className="text-3xl sm:text-5xl font-heading font-black text-amber-400 flex items-center justify-center gap-1.5">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 inline" />
            <span>{totalCategories}</span>
          </div>
          <div className="text-[11px] sm:text-xs font-mono uppercase text-white/90 font-bold tracking-wider mt-0.5">
            Official Categories
          </div>
        </div>

        <div className="text-center drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
          <div className="text-3xl sm:text-5xl font-heading font-black text-rose-400">
            {totalNominees}
          </div>
          <div className="text-[11px] sm:text-xs font-mono uppercase text-white/90 font-bold tracking-wider mt-0.5">
            Creators Honored
          </div>
        </div>
      </div>
    </section>
  );
};
