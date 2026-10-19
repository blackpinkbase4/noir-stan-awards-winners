import React, { useState } from 'react';
import { Trophy, Crown, Share2, Download, ExternalLink, Check, Sparkles } from 'lucide-react';
import { CategoryWinnerResult, NomineeResult } from '../types';
import { generateWinnerPoster } from '../lib/generatePoster';

interface WinnerCardProps {
  category: CategoryWinnerResult;
}

export const WinnerCard: React.FC<WinnerCardProps> = ({ category }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // The crowned winner is either the manual winner, the winner with highest votes, or first in winners array
  const winner: NomineeResult | undefined =
    category.winners?.[0] ||
    category.nominees.find((n) => n.is_winner) ||
    category.nominees[0];

  // Runners-up (everyone except the winner)
  const runnersUp = category.nominees.filter((n) => n.nominee_id !== winner?.nominee_id).slice(0, 4);

  const handleShareToTwitter = () => {
    const text = `🏆 OFFICIAL WINNER! Huge congratulations to @${winner.x_username} for taking home ${category.category_title} at the Noir Stan Awards '26! 🌟 #NoirStanAwards #OneTimelineEveryFandom`;
    const shareUrl = 'https://noir-stan-awards-winners.netlify.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    if (!winner || downloading) return;
    setDownloading(true);
    try {
      await generateWinnerPoster(category.category_title, winner);
    } catch (err) {
      console.error('Failed to generate poster:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `https://noir-stan-awards-winners.netlify.app#category-${category.category_id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!winner) return null;

  return (
    <div
      id={`category-${category.category_id}`}
      className="p-6 sm:p-8 rounded-3xl bg-vma-cardDark border border-white/10 hover:border-vma-mint/40 transition-all shadow-2xl space-y-6 relative overflow-hidden group"
    >
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-vma-mint/5 rounded-full blur-3xl pointer-events-none group-hover:bg-vma-mint/10 transition-colors" />

      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-vma-mint font-mono text-[11px] font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            <span>OFFICIAL CATEGORY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white tracking-tight">
            {category.category_title}
          </h2>
        </div>

        <button
          onClick={handleCopyLink}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-noir-900 border border-white/10 text-chrome-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          title="Copy category link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-vma-mint" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'COPIED!' : 'SHARE'}</span>
        </button>
      </div>

      {/* Main Champion Spotlight Card */}
      <div className="rounded-2xl bg-noir-900/90 border-2 border-vma-mint/80 p-5 sm:p-6 shadow-vma-mint space-y-6 relative">
        {/* Crown Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-noir-950 font-black text-xs uppercase tracking-wider shadow-vma-gold">
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>CROWNED WINNER</span>
        </div>

        {/* Winner Profile & Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar Photo Frame */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-noir-850 border-2 border-vma-mint shrink-0 shadow-lg relative group/avatar">
            {winner.avatar_url ? (
              <img
                src={winner.avatar_url}
                alt={winner.display_name}
                className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading font-black text-6xl text-vma-mint">
                {winner.display_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Winner Details & Action Buttons */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase tracking-tight">
                {winner.display_name}
              </h3>
              <a
                href={`https://x.com/${winner.x_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-vma-mint font-mono text-sm hover:underline"
              >
                <span>@{winner.x_username}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Vote Stats Chip */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-noir-950 border border-white/10 font-mono text-xs">
              <div>
                <strong className="text-white text-sm">{winner.votes.toLocaleString()}</strong>{' '}
                <span className="text-chrome-400">votes</span>
              </div>
              <div className="text-chrome-600">|</div>
              <div className="text-vma-mint font-bold">{winner.percentage}% of category ballot</div>
            </div>

            {/* Quick Viral Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleShareToTwitter}
                className="px-4 py-2.5 rounded-xl bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Tweet Congratulations</span>
              </button>

              <button
                type="button"
                disabled={downloading}
                onClick={handleDownload}
                className="px-4 py-2.5 rounded-xl bg-vma-mint hover:bg-vma-mintHover text-noir-950 font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-vma-mint disabled:opacity-50 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Rendering Card...' : 'Download Trophy Card'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Runners-Up Section */}
      {runnersUp.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-mono uppercase tracking-wider text-chrome-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-chrome-500" />
            <span>Official Runners-Up (Final Standings)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {runnersUp.map((runner, index) => (
              <div
                key={runner.nominee_id}
                className="p-3 rounded-xl bg-noir-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-chrome-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                    #{index + 2}
                  </span>
                  <div className="truncate">
                    <span className="font-heading font-black text-white text-sm truncate block">
                      {runner.display_name}
                    </span>
                    <span className="font-mono text-xs text-chrome-400 truncate block">
                      @{runner.x_username}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <strong className="text-white text-xs">{runner.votes.toLocaleString()}</strong>
                  <span className="text-[10px] text-chrome-400 block">{runner.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
