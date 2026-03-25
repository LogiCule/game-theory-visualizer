import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../games/core/TwoPlayerGameEngine';
import { verdictColor } from '../games/core/GameExplainer';
import type { MoveVerdict } from '../games/core/GameExplainer';

interface MoveHistoryProps {
  history: HistoryEntry<any>[];
}

const verdictDot: Record<MoveVerdict, string> = {
  optimal:    'bg-emerald-400',
  decent:     'bg-amber-300',
  suboptimal: 'bg-orange-400',
  blunder:    'bg-rose-400',
};

export default function MoveHistory({ history }: MoveHistoryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history]);

  return (
    <div className="bg-hextech-panel/60 backdrop-blur-md rounded-none shadow-2xl border border-hextech-border flex flex-col h-[500px] relative">
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-hextech-blue/50 opacity-50 m-1 pointer-events-none" />

      <div className="bg-hextech-dark/50 border-b border-hextech-border px-6 py-4">
        <h3 className="font-bold text-hextech-gold uppercase tracking-widest text-sm">Match Log</h3>
      </div>

      <div ref={scrollContainerRef} className="p-4 overflow-y-auto custom-scrollbar flex-grow">
        {history.length === 0 ? (
          <div className="text-hextech-border text-center mt-4 uppercase tracking-widest text-xs">Awaiting first move</div>
        ) : (
          <ul className="space-y-4">
            {history.map((entry, index) => {
              const isAlice = entry.player === 'Alice';
              const playerColorClass = isAlice
                ? 'bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30'
                : 'bg-[#0ac8b9]/10 text-[#0ac8b9] border-[#0ac8b9]/30';

              const verdict = entry.explanation?.verdict;
              const vcColor = verdict ? verdictColor[verdict] : null;
              const vdDot   = verdict ? verdictDot[verdict]   : null;

              return (
                <li key={index} className="flex items-start game-anim">
                  {/* Move number badge */}
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 text-xs font-bold mr-3 mt-0.5 shrink-0 border
                    ${playerColorClass}
                  `}>
                    {index + 1}
                  </span>

                  <div className="flex flex-col flex-1 min-w-0">
                    {/* Summary row */}
                    <div className="flex items-center flex-wrap gap-2">
                      {/* Verdict dot indicator */}
                      {vdDot && <span className={`w-2 h-2 rounded-full shrink-0 ${vdDot}`} />}

                      <span className="text-hextech-gold-light/80 text-sm font-mono tracking-tight">
                        {entry.explanation ? entry.explanation.summary : entry.description}
                      </span>
                    </div>

                    {/* Verdict badge + confidence */}
                    {verdict && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase tracking-wider rounded-sm ${vcColor}`}>
                          {verdict}
                        </span>
                        {entry.explanation?.confidence && (
                          <span className="text-[10px] text-hextech-gold/40 uppercase tracking-wider">
                            {entry.explanation.confidence} confidence
                          </span>
                        )}
                        {/* Tags */}
                        {entry.explanation?.tags && entry.explanation.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {entry.explanation.tags.slice(0, 2).map((tag, ti) => (
                              <span key={ti} className="text-[9px] px-1.5 py-0.5 bg-hextech-blue/5 border border-hextech-blue/20 text-hextech-blue/60 rounded-sm tracking-wide">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reasons list */}
                    {entry.explanation && entry.explanation.reasons.length > 0 && (
                      <ul className="mt-1.5 ml-1 space-y-0.5">
                        {entry.explanation.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-hextech-gold-light/55">
                            <span className="mt-1 w-1 h-1 rounded-full bg-hextech-gold/30 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
