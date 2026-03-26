import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import ScoreBoard from './ScoreBoard';
import TurnIndicator from './TurnIndicator';
import MoveHistory from './MoveHistory';
import type { AIDifficulty } from '../ai/AIStrategy';
import type { HistoryEntry } from '../games/core/TwoPlayerGameEngine';

interface GameContentGridProps {
  /** Left column: the game board JSX */
  board: ReactNode;
  /** Optional banner shown above the board (oracle / controls) */
  boardControls?: ReactNode;

  // Scoreboard
  scores?: { Alice: number; Bob: number };
  showScore?: boolean;

  // Turn / winner banner
  currentPlayer?: 'Alice' | 'Bob';
  gameOver?: boolean;
  winner?: 'Alice' | 'Bob' | 'Draw' | 'Tie' | null;
  gameMode?: 'pvp' | 'pve';
  difficulty?: AIDifficulty;

  // Match log
  history?: HistoryEntry<any>[];

  // Post-game actions
  onReset?: () => void;
  replayData?: { 
    gameId: string; 
    initialConfig: string; 
    history: any[]; 
    gameMode?: 'pvp' | 'pve';
    difficulty?: AIDifficulty;
  };
  isReplay?: boolean;
}

/**
 * GameContentGrid — two-column layout component.
 *
 * LEFT  (1fr)   : ScoreBoard → TurnIndicator → boardControls → Board
 * RIGHT (360px) : MoveHistory (sticky)
 *
 * Action buttons (Deploy Again / Watch Replay) appear below the grid
 * so they never disturb column alignment.
 */
export default function GameContentGrid({
  board,
  boardControls,
  scores,
  showScore = true,
  currentPlayer,
  gameOver,
  winner,
  gameMode,
  difficulty,
  history,
  onReset,
  replayData,
  isReplay,
}: GameContentGridProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* ── Boxed container for Board + History ───────────────────────────── */}
      <div className="game-anim rounded-xl border border-hextech-gold/20 bg-gradient-to-b from-[#0b0f14]/80 to-[#05070a]/80 shadow-[0_0_40px_rgba(200,155,60,0.08)] p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_360px] gap-8 items-stretch">

          {/* LEFT column — active gameplay & result */}
          <div className="flex flex-col items-center gap-4 w-full h-full min-h-0 py-2">
            {scores && (
              <div className="w-full">
                <ScoreBoard
                  aliceScore={scores.Alice}
                  bobScore={scores.Bob}
                  showScore={showScore}
                  gameOver={gameOver}
                  winner={winner}
                  gameMode={gameMode}
                  difficulty={difficulty}
                />
              </div>
            )}

            {currentPlayer && gameOver !== undefined && (
              <div className="w-full">
                <TurnIndicator
                  currentPlayer={currentPlayer}
                  gameOver={!!gameOver}
                  isReplay={isReplay}
                />
              </div>
            )}

            {boardControls && (
              <div className="w-full">
                {boardControls}
              </div>
            )}

            <div className="w-full flex justify-center items-center min-h-0 overflow-hidden">
              {board}
            </div>
          </div>

          {/* SUBTLE SEPARATOR */}
          <div className="hidden lg:block w-px bg-hextech-gold/10 my-4" />

          {/* RIGHT column — match history */}
          <div className="flex flex-col max-h-[600px] lg:max-h-[700px] min-h-0 overflow-hidden py-2 px-2">
            {history && <MoveHistory history={history} />}
          </div>
        </div>
      </div>

      {/* ── ALIGNED ACTION BUTTONS (Outside the box) ───────────────────────── */}
      {gameOver && (onReset || replayData) && (
        <div className="game-anim flex flex-col md:flex-row justify-center gap-6 w-full mt-10">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center justify-center bg-hextech-dark border border-hextech-gold text-hextech-gold hover:text-hextech-gold-light hover:bg-[#c89b3c]/20 font-bold py-4 px-10 transition-all duration-300 shadow-[0_0_20px_rgba(200,155,60,0.15)] hover:shadow-[0_0_30px_rgba(200,155,60,0.3)] cursor-pointer uppercase tracking-widest relative overflow-hidden group/btn w-full md:w-auto min-w-[220px]"
            >
              <div className="absolute inset-0 bg-hextech-gold/10 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
              <RefreshCw className="mr-3" size={18} />
              Deploy Again
            </button>
          )}
          {replayData && (
            <button
              onClick={() => navigate('/replay', { state: replayData })}
              className="flex items-center justify-center bg-hextech-blue/10 border border-hextech-blue text-hextech-blue hover:text-[#0ac8b9] hover:bg-hextech-blue/20 font-bold py-4 px-10 transition-all duration-300 shadow-[0_0_20px_rgba(10,200,185,0.15)] hover:shadow-[0_0_30px_rgba(10,200,185,0.3)] cursor-pointer uppercase tracking-widest relative overflow-hidden group/btn w-full md:w-auto min-w-[220px]"
            >
              <div className="absolute inset-0 bg-hextech-blue/10 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Watch Replay
            </button>
          )}
        </div>
      )}
    </div>
  );
}
