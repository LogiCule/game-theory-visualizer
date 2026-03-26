import type { Player } from '../games/core/TwoPlayerGameEngine';
import { User } from 'lucide-react';
import type { AIDifficulty } from '../ai/AIStrategy';

interface TurnIndicatorProps {
  currentPlayer: Player;
  gameOver: boolean;
  winner: string | null;
  gameMode?: 'pvp' | 'pve';
  difficulty?: AIDifficulty;
  isReplay?: boolean;
}

const DIFFICULTY_BADGE: Record<AIDifficulty, { label: string; color: string }> = {
  easy:   { label: 'Easy',   color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' },
  medium: { label: 'Medium', color: 'text-amber-400 border-amber-500/50 bg-amber-500/10' },
  hard:   { label: 'Hard',   color: 'text-rose-400 border-rose-500/50 bg-rose-500/10' },
};

export default function TurnIndicator({ currentPlayer, gameOver, winner, gameMode, difficulty, isReplay }: TurnIndicatorProps) {
  if (gameOver) {
    const isPve = gameMode === 'pve';
    const badge = isPve && difficulty ? DIFFICULTY_BADGE[difficulty] : null;

    return (
      <div className="flex justify-center items-center mb-10">
        <div className="bg-hextech-dark/90 border border-hextech-gold text-hextech-gold px-8 py-4 font-bold text-xl flex flex-col items-center shadow-[0_0_15px_rgba(200,155,60,0.2)] uppercase tracking-widest relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hextech-gold to-transparent"></div>
          <span className="text-sm text-hextech-gold-light/60 mb-1">Game Over</span>
          <span>{winner === 'Tie' ? "It's a Tie!" : `Victory: ${winner}`}</span>
          {/* Game Mode sub-label */}
          <div className="flex items-center gap-2 mt-2">
            {isPve ? (
              <>
                <span className="text-xs font-normal tracking-widest uppercase text-hextech-gold/50">AI Mode</span>
                {badge && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm ${badge.color}`}>
                    {badge.label}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs font-normal tracking-widest uppercase text-hextech-gold/50">Local Mode</span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-hextech-gold to-transparent"></div>
        </div>
      </div>
    );
  }

  const isAlice = currentPlayer === 'Alice';
  const colorClass = isAlice ? 'text-[#c89b3c] border-[#c89b3c]/50 shadow-[0_0_15px_rgba(200,155,60,0.2)]' : 'text-[#0ac8b9] border-[#0ac8b9]/50 shadow-[0_0_15px_rgba(10,200,185,0.2)]';
  const iconColor = isAlice ? 'text-[#c89b3c]' : 'text-[#0ac8b9]';

  return (
    <div className="flex justify-center items-center mb-10">
      <div className={`
        flex items-center space-x-3 px-8 py-3 bg-hextech-panel/80 backdrop-blur-sm border-t border-b font-bold text-lg uppercase tracking-widest transition-all duration-500
        ${colorClass}
      `}>
        <User size={18} className={iconColor} />
        <span>{isReplay ? `${currentPlayer}'s Turn` : `Awaiting ${currentPlayer}`}</span>
      </div>
    </div>
  );
}

