import React, { useState } from 'react';
import { Trophy, Crown, Share2, Download, ExternalLink, Sparkles, Award } from 'lucide-react';
import { CategoryWinnerResult, NomineeResult } from '../types';
import { generateNomineePoster } from '../lib/generatePoster';

interface HallOfFameProps {
  categories: CategoryWinnerResult[];
  onSelectCategory?: (categoryId: string) => void;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ categories, onSelectCategory }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Extract the #1 Champion for each category
  const champions = categories.map((cat) => {
    const winner: NomineeResult =
      cat.winners?.[0] ||
      cat.nominees.find((n) => n.is_winner) ||
      cat.nominees[0];
    return {
      category: cat,
      winner,
    };
  }).filter((c) => Boolean(c.winner));

  const handleShareToTwitter = (championName: string, handle: string, categoryTitle: string, votes: number) => {
    const text = `🏆 HALL OF FAME! Crowned #1 Champion in ${categoryTitle} is @${handle} with ${votes.toLocaleString()} votes at the Noir Stan Awards '26! 🌟 #NoirStanAwards #OneTimelineEveryFandom`;
    const shareUrl = 'https://noir-stan-awards-winners.netlify.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (categoryTitle: string, nominee: NomineeResult) => {
    if (downloadingId) return;
    setDownloadingId(nominee.nominee_id);
    try {
      await generateNomineePoster(categoryTitle, nominee, 1);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="space-y-8 relative">
      {/* Hall of Fame Header */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-black uppercase tracking-widest shadow-vma-gold">
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>VIP WINNERS CIRCLE // ALL 12 CHAMPIONS</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h2 className="text-3xl sm:text-6xl font-heading font-black uppercase text-white tracking-tight drop-shadow-lg">
          THE GOLDEN <span className="text-vma-gold">HALL OF FAME</span>
        </h2>
        <p className="text-xs sm:text-sm text-chrome-300 font-mono max-w-2xl mx-auto leading-relaxed">
          The crowned champions who took 1st Place across every official category. Certified by the timeline's votes.
        </p>
      </div>

      {/* Grid of Champions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {champions.map(({ category, winner }) => (
          <div
            key={category.category_id}
            className="p-5 rounded-2xl bg-black/60 backdrop-blur-md border-2 border-amber-400/70 hover:border-amber-300 transition-all duration-300 shadow-xl hover:shadow-vma-gold flex flex-col justify-between space-y-4 group relative overflow-hidden"
          >
            {/* Top Category Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{category.category_title}</span>
                </span>
                <span className="bg-amber-400 text-noir-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  #1 GOLD
                </span>
              </div>
            </div>

            {/* Winner Photo & Glow */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-noir-850 border-4 border-amber-400 shadow-vma-gold ring-4 ring-amber-400/20 group-hover:scale-105 transition-transform duration-300">
                  {winner.avatar_url ? (
                    <img
                      src={winner.avatar_url}
                      alt={winner.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-heading font-black text-5xl text-amber-400">
                      {winner.display_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-noir-950 p-1.5 rounded-full shadow-lg">
                  <Crown className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Names */}
              <div className="w-full space-y-0.5">
                <h3 className="font-heading font-black text-2xl text-white uppercase tracking-tight truncate">
                  {winner.display_name}
                </h3>
                <a
                  href={`https://x.com/${winner.x_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-vma-mint hover:underline font-mono text-xs"
                >
                  <span>@{winner.x_username}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Vote Stats */}
              <div className="px-3 py-1 rounded-xl bg-noir-950 border border-white/10 font-mono text-xs">
                <strong className="text-amber-300">{winner.votes.toLocaleString()}</strong> votes ({winner.percentage}%)
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleShareToTwitter(winner.display_name, winner.x_username, category.category_title, winner.votes)}
                  className="py-2 px-2 rounded-xl bg-noir-900 hover:bg-[#1d9bf0] hover:text-white border border-white/10 text-chrome-300 font-heading font-black text-[11px] uppercase flex items-center justify-center gap-1 transition-all"
                  title="Tweet congratulations"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Tweet</span>
                </button>

                <button
                  type="button"
                  disabled={downloadingId === winner.nominee_id}
                  onClick={() => handleDownload(category.category_title, winner)}
                  className="py-2 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-noir-950 font-heading font-black text-[11px] uppercase flex items-center justify-center gap-1 transition-all shadow-vma-gold"
                  title="Download official champion poster"
                >
                  <Download className="w-3 h-3" />
                  <span>{downloadingId === winner.nominee_id ? '...' : 'Card'}</span>
                </button>
              </div>

              {onSelectCategory && (
                <button
                  type="button"
                  onClick={() => onSelectCategory(category.category_id)}
                  className="w-full py-1.5 rounded-lg text-center font-mono text-[10px] text-chrome-400 hover:text-vma-mint transition-colors"
                >
                  View full category rankings →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
