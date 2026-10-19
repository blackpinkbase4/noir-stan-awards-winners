import React, { useState } from 'react';
import { Crown, Medal, Trophy, Share2, Download, ExternalLink } from 'lucide-react';
import { NomineeResult } from '../types';
import { generateNomineePoster } from '../lib/generatePoster';

interface PodiumTop3Props {
  nominees: NomineeResult[];
  categoryTitle: string;
}

export const PodiumTop3: React.FC<PodiumTop3Props> = ({ nominees, categoryTitle }) => {
  const first = nominees[0];
  const second = nominees[1];
  const third = nominees[2];

  if (!first) return null;

  return (
    <div className="relative pt-6 pb-2">
      {/* 3D-Style Podium Standings (2nd, 1st, 3rd) Standing Straight on the Red Carpet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end max-w-4xl mx-auto relative z-10">
        {/* 2nd Place (Silver - Left) */}
        {second ? (
          <div className="order-2 md:order-1 flex flex-col items-center">
            <PodiumCard nominee={second} rank={2} categoryTitle={categoryTitle} />
            <div className="w-full py-2.5 bg-black/75 backdrop-blur-md border-t-2 border-slate-300 rounded-b-2xl text-center font-heading font-black text-xs sm:text-sm tracking-wider text-slate-200 shadow-md">
              🥈 TOP 2 CONTENDER (BY VOTES)
            </div>
          </div>
        ) : <div className="order-1 hidden md:block" />}

        {/* 1st Place (Gold - Tallest Center) */}
        <div className="order-1 md:order-2 flex flex-col items-center z-20">
          <PodiumCard nominee={first} rank={1} categoryTitle={categoryTitle} isChampion />
          <div className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black rounded-b-2xl text-center font-heading font-black text-sm sm:text-base tracking-widest shadow-vma-gold">
            <div className="flex items-center justify-center gap-1.5">
              <Crown className="w-5 h-5 fill-current animate-bounce" />
              <span>👑 1ST PLACE WINNER (BY VOTES)</span>
            </div>
          </div>
        </div>

        {/* 3rd Place (Bronze - Right) */}
        {third ? (
          <div className="order-3 md:order-3 flex flex-col items-center">
            <PodiumCard nominee={third} rank={3} categoryTitle={categoryTitle} />
            <div className="w-full py-2.5 bg-black/75 backdrop-blur-md border-t-2 border-amber-600 rounded-b-2xl text-center font-heading font-black text-xs sm:text-sm tracking-wider text-amber-300 shadow-sm">
              🥉 TOP 3 CONTENDER (BY VOTES)
            </div>
          </div>
        ) : <div className="order-3 hidden md:block" />}
      </div>
    </div>
  );
};

interface PodiumCardProps {
  nominee: NomineeResult;
  rank: number;
  categoryTitle: string;
  isChampion?: boolean;
}

const PodiumCard: React.FC<PodiumCardProps> = ({ nominee, rank, categoryTitle, isChampion }) => {
  const [downloading, setDownloading] = useState(false);

  const handleShareToTwitter = () => {
    let rankText = `placed TOP ${rank} CONTENDER`;
    if (rank === 1) rankText = 'took home 1ST PLACE & WON';
    else if (rank === 2) rankText = 'took TOP 2 CONTENDER (BY VOTES)';
    else if (rank === 3) rankText = 'took TOP 3 CONTENDER (BY VOTES)';

    const text = `🏆 Official Final Results! Congratulations to @${nominee.x_username} who ${rankText} in ${categoryTitle} with ${nominee.votes.toLocaleString()} votes at the Noir Stan Awards '26! 🌟 #NoirStanAwards #OneTimelineEveryFandom`;
    const shareUrl = 'https://noir-stan-awards-winners.netlify.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await generateNomineePoster(categoryTitle, nominee, rank);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={`w-full p-4 sm:p-5 rounded-t-2xl text-center space-y-3 transition-all relative overflow-hidden backdrop-blur-md ${
        isChampion
          ? 'bg-black/75 border-2 border-amber-400 shadow-vma-gold md:scale-105'
          : rank === 2
          ? 'bg-black/65 border border-slate-300/60 shadow-lg'
          : 'bg-black/65 border border-amber-700/60 shadow-lg'
      }`}
    >
      {/* Avatar with Glow Ring */}
      <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-black border-2 border-white/20 shadow-lg">
        {nominee.avatar_url ? (
          <img
            src={nominee.avatar_url}
            alt={nominee.display_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-heading font-black text-4xl text-amber-300">
            {nominee.display_name.charAt(0)}
          </div>
        )}

        {isChampion && (
          <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black p-1 rounded-full shadow-md">
            <Crown className="w-3.5 h-3.5 fill-current" />
          </div>
        )}
      </div>

      {/* Nominee Name & Handle */}
      <div className="space-y-0.5">
        <h3 className="font-heading font-black text-lg sm:text-xl text-white uppercase tracking-tight truncate drop-shadow-md">
          {nominee.display_name}
        </h3>
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

      {/* Vote Count & Percent */}
      <div className="py-2 px-3 rounded-xl bg-black/70 border border-white/10 space-y-0.5">
        <div className="font-heading font-black text-lg sm:text-xl text-white tracking-wide">
          {nominee.votes.toLocaleString()}
          <span className="text-xs font-mono text-chrome-400 font-normal ml-1">votes</span>
        </div>
        <div className="font-mono text-xs text-amber-300 font-bold">
          {nominee.percentage}% of category votes
        </div>
      </div>

      {/* Action Buttons: Twitter Share & Download Winner Card */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleShareToTwitter}
          className="p-2 rounded-xl bg-[#1d9bf0]/20 hover:bg-[#1d9bf0]/40 border border-[#1d9bf0]/40 text-[#1d9bf0] transition-colors"
          title="Share on Twitter"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{downloading ? 'Generating...' : 'Save Card'}</span>
        </button>
      </div>
    </div>
  );
};
