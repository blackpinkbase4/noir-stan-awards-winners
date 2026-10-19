import React, { useState } from 'react';
import { Crown, Medal, Share2, Download, ExternalLink } from 'lucide-react';
import { NomineeResult } from '../types';
import { generateNomineePoster } from '../lib/generatePoster';

interface NomineeCardProps {
  nominee: NomineeResult;
  rank: number;
  categoryTitle: string;
}

export const NomineeCard: React.FC<NomineeCardProps> = ({ nominee, rank, categoryTitle }) => {
  const [downloading, setDownloading] = useState(false);

  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  // Rank Styling
  let borderStyle = 'border-amber-400/20 hover:border-amber-400/60 bg-black/60 backdrop-blur-md';
  let badgeStyle = 'bg-black/70 text-amber-200/90 border-amber-400/30';
  let badgeLabel = `TOP ${rank} CONTENDER (BY VOTES)`;
  let badgeIcon = <Medal className="w-3.5 h-3.5 text-amber-400" />;

  if (isFirst) {
    borderStyle = 'border-amber-400/90 ring-1 ring-amber-400/50 shadow-vma-gold bg-black/75 backdrop-blur-md';
    badgeStyle = 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black border-amber-300 font-black shadow-vma-gold';
    badgeLabel = '👑 1ST PLACE WINNER (BY VOTES)';
    badgeIcon = <Crown className="w-3.5 h-3.5 fill-current" />;
  } else if (isSecond) {
    borderStyle = 'border-slate-300/60 bg-black/60 backdrop-blur-md';
    badgeStyle = 'bg-slate-200 text-black border-white font-bold';
    badgeLabel = '🥈 TOP 2 CONTENDER (BY VOTES)';
    badgeIcon = <Medal className="w-3.5 h-3.5" />;
  } else if (isThird) {
    borderStyle = 'border-amber-700/60 bg-black/60 backdrop-blur-md';
    badgeStyle = 'bg-gradient-to-r from-amber-700 to-amber-600 text-white border-amber-500 font-bold';
    badgeLabel = '🥉 TOP 3 CONTENDER (BY VOTES)';
    badgeIcon = <Medal className="w-3.5 h-3.5" />;
  }

  const handleShareToTwitter = () => {
    let rankText = `placed TOP ${rank} CONTENDER`;
    if (isFirst) rankText = 'took home 1ST PLACE & WON';
    else if (isSecond) rankText = 'took TOP 2 CONTENDER (BY VOTES)';
    else if (isThird) rankText = 'took TOP 3 CONTENDER (BY VOTES)';

    const text = `🏆 Official Final Results! Congratulations to @${nominee.x_username} who ${rankText} in ${categoryTitle} with ${nominee.votes.toLocaleString()} votes at the Noir Stan Awards '26! 🌟 #NoirStanAwards #OneTimelineEveryFandom`;
    const shareUrl = 'https://noir-stan-awards-winners.netlify.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadCard = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await generateNomineePoster(categoryTitle, nominee, rank);
    } catch (err) {
      console.error('Failed to download nominee card:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.01] ${borderStyle}`}
    >
      {/* Header: Rank Badge & Handle */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wider border uppercase ${badgeStyle}`}
        >
          {badgeIcon}
          <span>{badgeLabel}</span>
        </span>

        <span className="text-xs font-mono text-chrome-400">
          Rank #{rank}
        </span>
      </div>

      {/* Nominee Profile */}
      <div className="flex items-center gap-3.5">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-black border border-white/20 shrink-0">
          {nominee.avatar_url ? (
            <img
              src={nominee.avatar_url}
              alt={nominee.display_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-heading font-black text-2xl text-amber-300">
              {nominee.display_name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-heading font-black text-base sm:text-lg text-white uppercase tracking-tight truncate drop-shadow-sm">
            {nominee.display_name}
          </h4>
          <a
            href={`https://x.com/${nominee.x_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-chrome-300 hover:text-amber-300 text-xs font-mono transition-colors"
          >
            <span>@{nominee.x_username}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Vote Metrics */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-xs">
        <div>
          <span className="text-chrome-400">Votes: </span>
          <strong className="text-white font-heading font-black text-sm">
            {nominee.votes.toLocaleString()}
          </strong>
        </div>
        <div className="text-amber-300 font-bold">
          {nominee.percentage}% of votes
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleShareToTwitter}
          className="py-2 px-3 rounded-xl bg-[#1d9bf0]/20 hover:bg-[#1d9bf0]/40 border border-[#1d9bf0]/40 text-[#1d9bf0] font-heading font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Tweet</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCard}
          disabled={downloading}
          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{downloading ? 'Saving...' : 'Card'}</span>
        </button>
      </div>
    </div>
  );
};
