import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { CategoryWinnerResult } from '../types';
import { PodiumTop3 } from './PodiumTop3';
import { NomineeCard } from './NomineeCard';

interface CategoryStageProps {
  category: CategoryWinnerResult;
}

export const CategoryStage: React.FC<CategoryStageProps> = ({ category }) => {
  const [showAll, setShowAll] = useState(false);

  // Remaining nominees (rank #4 and beyond)
  const otherNominees = category.nominees.slice(3);

  return (
    <div
      id={`category-${category.category_id}`}
      className="space-y-6 py-4 relative"
    >
      {/* Stage Header Sitting Directly on the Red Carpet (Total Votes Pill Removed) */}
      <div className="border-b border-amber-400/30 pb-3 drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">
        <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>OFFICIAL STAGE PRESENTATION</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase text-white tracking-tight drop-shadow-[0_4px_25px_rgba(0,0,0,1)]">
          {category.category_title}
        </h2>
      </div>

      {/* The 3D Podium for Top 3 (WINNER, TOP 2, TOP 3) Straight on Red Carpet */}
      <PodiumTop3 nominees={category.nominees} categoryTitle={category.category_title} />

      {/* Ranks #4 and Beyond (Expandable / Clean List Straight on Carpet) */}
      {otherNominees.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-amber-400/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5 drop-shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Lineup (Top 4 to Top {category.nominees.length})</span>
            </span>

            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-mono font-bold text-amber-200 hover:text-white flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-black/60 border border-amber-400/40 backdrop-blur-md transition-colors"
            >
              <span>{showAll ? 'Show Top 6 Only' : `View All (${otherNominees.length} Nominees)`}</span>
              {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Grid of remaining nominees */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 transition-all duration-500 ${
              !showAll && otherNominees.length > 3 ? 'max-h-[480px] overflow-hidden relative' : ''
            }`}
          >
            {otherNominees.map((nominee, idx) => (
              <NomineeCard
                key={nominee.nominee_id}
                nominee={nominee}
                rank={idx + 4}
                categoryTitle={category.category_title}
              />
            ))}

            {/* Gradient fade if collapsed */}
            {!showAll && otherNominees.length > 3 && (
              <div
                onClick={() => setShowAll(true)}
                className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/85 to-transparent flex items-end justify-center pb-4 cursor-pointer"
              >
                <span className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-heading font-black text-xs uppercase tracking-wider shadow-vma-gold hover:scale-105 transition-transform">
                  Show All {category.nominees.length} Contenders ▾
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
