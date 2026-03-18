import { useState } from 'react';

interface FrontTakeRowProps {
  piles: number[];
  maxTake: number;
  gameActive: boolean;
  onTake: (count: number) => void;
}

export default function FrontTakeRow({ piles, maxTake, gameActive, onTake }: FrontTakeRowProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (piles.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center bg-hextech-dark/50 backdrop-blur-sm border border-hextech-border rounded-none shadow-inner">
        <span className="text-hextech-border font-bold uppercase tracking-widest text-lg">No stones left</span>
      </div>
    );
  }

  // Bracket sizing logic
  const bracketCount = Math.min(maxTake, piles.length);

  return (
    <div className={`bg-hextech-panel/40 backdrop-blur-sm shadow-2xl border border-hextech-border min-h-[140px] md:min-h-[160px] w-full py-6 px-2 md:py-8 md:px-4 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <div className="flex-1 relative mx-4 min-w-0 flex items-center h-full">
        {/* Fading Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#1e2328] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#1e2328] to-transparent pointer-events-none z-10" />
        
        <div className="overflow-x-auto custom-scrollbar flex items-center w-full px-1 md:px-2 py-4">
          <div className="flex flex-nowrap items-center min-w-max gap-2 md:gap-4 px-4 md:px-8 relative mt-6">
            
            {/* Valid Selection Bracket */}
            {gameActive && bracketCount > 0 && (
              <div 
                className="absolute top-[-20px] left-8 pointer-events-none transition-all duration-300 z-0 border-t border-l border-r border-hextech-blue/50"
                style={{ 
                  height: '10px',
                  width: `calc((${bracketCount} * 5rem) + ((${bracketCount} - 1) * 1rem))`, 
                }}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-hextech-blue text-xs font-bold tracking-widest uppercase">
                  Max Range ({bracketCount})
                </div>
              </div>
            )}
            
            {piles.map((pile, idx) => {
              const takes = idx + 1;
              const isSelectable = gameActive && takes <= maxTake;
              const willBeSelected = isSelectable && hoverIndex !== null && hoverIndex >= idx;

              return (
                <button
                  key={`front-${idx}`}
                  disabled={!isSelectable}
                  onMouseEnter={() => isSelectable && setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => isSelectable && onTake(takes)}
                  className={`
                    relative flex items-center justify-center group shrink-0
                    h-24 w-20 font-black text-3xl shadow-xl transition-all duration-300
                    ${isSelectable 
                      ? 'bg-hextech-panel border border-hextech-blue/50 text-hextech-gold-light cursor-pointer z-10' 
                      : 'bg-hextech-dark/50 border border-hextech-border text-hextech-border cursor-not-allowed opacity-60'
                    }
                    ${willBeSelected ? 'ring-2 ring-hextech-blue bg-hextech-blue/10 transform -translate-y-2 !border-hextech-blue' : ''}
                  `}
                  style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr from-hextech-blue/20 to-transparent opacity-0 transition-opacity duration-300 ${isSelectable ? 'group-hover:opacity-100' : ''} ${willBeSelected ? 'opacity-100' : ''}`} />
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ${isSelectable ? 'bg-hextech-blue' : 'bg-hextech-border'}`} />
                  <span className="relative z-10 drop-shadow-md">{pile}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
