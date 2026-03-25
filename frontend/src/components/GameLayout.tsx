import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScoreBoard from './ScoreBoard';
import TurnIndicator from './TurnIndicator';
import MoveHistory from './MoveHistory';
import type { AIDifficulty } from '../ai/AIStrategy';

interface GameLayoutProps {
  title: string;
  isGameActive: boolean;
  setupContent: ReactNode;
  
  // Game state props
  scores?: { Alice: number; Bob: number };
  showScore?: boolean;
  currentPlayer?: 'Alice' | 'Bob';
  gameOver?: boolean;
  winner?: 'Alice' | 'Bob' | 'Draw' | 'Tie' | null;
  history?: import('../games/core/TwoPlayerGameEngine').HistoryEntry<any>[];
  replayData?: {
    gameId: string;
    initialConfig: string;
    moves: any[];
  };
  
  // Game mode & difficulty (for winner banner display)
  gameMode?: 'pvp' | 'pve';
  difficulty?: AIDifficulty;

  // Actions
  onReset?: () => void;

  // Specific game interactive elements (PileRow, FrontTakeRow, etc)
  children?: ReactNode;
}

export default function GameLayout({
  title,
  isGameActive,
  setupContent,
  scores,
  showScore = true,
  currentPlayer,
  gameOver,
  winner,
  history,
  replayData,
  gameMode,
  difficulty,
  onReset,
  children
}: GameLayoutProps) {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.game-anim', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
    });
  }, { scope: container, dependencies: [isGameActive] });

  return (
    <div ref={container} className="min-h-screen p-4 md:p-8 text-hextech-gold-light pt-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-hextech-blue/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-hextech-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-10 md:mb-12 mt-2 md:mt-0">
          <button 
            onClick={() => navigate('/')}
            className="absolute left-0 flex items-center text-hextech-gold hover:text-hextech-gold-light transition-colors cursor-pointer group tracking-widest uppercase text-xs md:text-sm font-bold z-10"
          >
            <ArrowLeft className="mr-1 md:mr-3 text-hextech-blue group-hover:-translate-x-1 transition-transform" size={20} />
            <span className="hidden sm:inline">Lobby</span>
          </button>
          
          <div className="inline-block relative text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-hextech-gold-light to-hextech-gold uppercase whitespace-nowrap">
              {title}
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hextech-blue to-transparent" />
          </div>
        </div>

        {!isGameActive ? (
          setupContent
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col items-center w-full max-w-3xl mx-auto">
              
              {scores && (
                <div className="game-anim w-full">
                  <ScoreBoard aliceScore={scores.Alice} bobScore={scores.Bob} showScore={showScore} />
                </div>
              )}
              
              {currentPlayer && gameOver !== undefined && winner !== undefined && (
                <div className="game-anim">
                  <TurnIndicator 
                    currentPlayer={currentPlayer} 
                    gameOver={gameOver} 
                    winner={winner}
                    gameMode={gameMode}
                    difficulty={difficulty}
                  />
                </div>
              )}
              
              <div className="game-anim w-full mb-8">
                {children}
              </div>

              {gameOver && (onReset || replayData) && (
                <div className="game-anim flex flex-col md:flex-row justify-center gap-4 mt-6 w-full">
                  {onReset && (
                    <button 
                      onClick={onReset}
                      className="flex items-center justify-center bg-hextech-dark border border-hextech-gold text-hextech-gold hover:text-hextech-gold-light hover:bg-[#c89b3c]/20 font-bold py-4 px-8 transition-all duration-300 shadow-[0_0_15px_rgba(200,155,60,0.15)] hover:shadow-[0_0_25px_rgba(200,155,60,0.3)] cursor-pointer uppercase tracking-widest relative overflow-hidden group/btn w-full md:w-auto min-w-[200px]"
                    >
                      <div className="absolute inset-0 bg-hextech-gold/10 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
                      <RefreshCw className="mr-3" size={18} />
                      Deploy Again
                    </button>
                  )}
                  {replayData && (
                    <button 
                      onClick={() => navigate('/replay', { state: replayData })}
                      className="flex items-center justify-center bg-hextech-blue/10 border border-hextech-blue text-hextech-blue hover:text-[#0ac8b9] hover:bg-hextech-blue/20 font-bold py-4 px-8 transition-all duration-300 shadow-[0_0_15px_rgba(10,200,185,0.15)] hover:shadow-[0_0_25px_rgba(10,200,185,0.3)] cursor-pointer uppercase tracking-widest relative overflow-hidden group/btn w-full md:w-auto min-w-[200px]"
                    >
                      <div className="absolute inset-0 bg-hextech-blue/10 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 filter drop-shadow-md">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Watch Replay
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1 h-full w-full game-anim">
              {history && <MoveHistory history={history} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
