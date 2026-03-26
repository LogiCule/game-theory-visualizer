import type { Player } from '../games/core/TwoPlayerGameEngine';
import { User } from 'lucide-react';

interface TurnIndicatorProps {
  currentPlayer: Player;
  gameOver: boolean;
  isReplay?: boolean;
}


export default function TurnIndicator({ currentPlayer, gameOver, isReplay }: TurnIndicatorProps) {
  if (gameOver) return null;

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

