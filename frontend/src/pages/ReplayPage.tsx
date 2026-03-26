import { useState, useEffect, useMemo } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { getEngineForGame } from '../games/engineRegistry';
import GameLayout from '../components/GameLayout';
import GameContentGrid from '../components/GameContentGrid';
import PileRow from '../components/PileRow';
import FrontTakeRow from '../components/FrontTakeRow';

export default function ReplayPage() {
  const location = useLocation();
  const replayData = location.state as { gameId: string; initialConfig: string; history: any[] };

  if (!replayData || !replayData.gameId) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center text-hextech-gold-light relative overflow-hidden bg-[#0a0a0c]">
        {/* Background Ambience */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-hextech-blue/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-hextech-gold/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-xl">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-hextech-gold-light to-hextech-gold uppercase">
            Void State Detected
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-hextech-blue to-transparent w-full mb-8" />
          <p className="text-lg md:text-xl text-hextech-gold/80 mb-10 leading-relaxed font-serif italic drop-shadow-md">
            "It seems your timeline has been erased by the Chronoshift. Or perhaps you just wandered into the abyss without a replay file. Either way, there is nothing to see here."
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center bg-hextech-dark/60 border border-hextech-gold text-hextech-gold hover:text-hextech-gold-light hover:bg-[#c89b3c]/20 font-bold py-4 px-10 transition-all duration-300 shadow-[0_0_20px_rgba(200,155,60,0.15)] hover:shadow-[0_0_30px_rgba(200,155,60,0.3)] cursor-pointer uppercase tracking-widest relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-hextech-gold/10 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
            Return to Lobby
          </a>
        </div>
      </div>
    );
  }

  const { gameId, initialConfig, history } = replayData;

  const { engine, states } = useMemo(() => {
    const eng = getEngineForGame(gameId);
    if (!eng) return { engine: null, states: [] };

    const st = [eng.getInitialState(initialConfig)];
    let currentState = st[0];
    for (const entry of (history || [])) {
      currentState = eng.makeMove(currentState, entry.move);
      // Copy explanation if it exists
      if (entry.explanation && currentState.history.length > 0) {
        currentState.history[currentState.history.length - 1].explanation = entry.explanation;
      }
      st.push(currentState);
    }
    return { engine: eng, states: st };
  }, [gameId, initialConfig, history]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isPlaying && currentStep < states.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === states.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, states.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying) return;
      if (e.key === 'ArrowLeft') {
        setCurrentStep(s => Math.max(0, s - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentStep(s => Math.min(states.length - 1, s + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, states.length]);

  if (!engine || states.length === 0) {
    return <Navigate to="/" replace />;
  }

  const gameState = states[currentStep];

  let lastChange: { row: number, col: number } | null = null;
  if (currentStep > 0 && gameState.board && states[currentStep - 1].board) {
    const prevBoard = states[currentStep - 1].board;
    const currBoard = gameState.board;
    // Safely check if dimensions match to avoid errors
    if (prevBoard.length === currBoard.length) {
      for (let r = 0; r < currBoard.length; r++) {
        if (currBoard[r] && prevBoard[r] && currBoard[r].length === prevBoard[r].length) {
          for (let c = 0; c < currBoard[r].length; c++) {
            if (currBoard[r][c] !== prevBoard[r][c]) {
              lastChange = { row: r, col: c };
            }
          }
        }
      }
    }
  }

  const renderBoard = () => {
    switch (gameId) {
      case 'stone-game-1':
        return (
          <PileRow 
            piles={gameState.piles} 
            gameActive={false}
            onTakeLeft={() => {}}
            onTakeRight={() => {}}
          />
        );
      case 'stone-game-2':
        return (
          <>
            <div className="text-center mb-6 text-hextech-blue font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(10,200,185,0.5)]">
              Current Multiplier (M): {gameState.M} &nbsp;&mdash;&nbsp; Max Take: {2 * gameState.M}
            </div>
            <FrontTakeRow 
              piles={gameState.piles} 
              maxTake={2 * gameState.M}
              gameActive={false}
              onTake={() => {}}
            />
          </>
        );
      case 'stone-game-3':
        return (
          <>
            <div className="text-center mb-6 text-hextech-blue font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(10,200,185,0.5)]">
              Max Take: 3 Stones
            </div>
            <FrontTakeRow 
              piles={gameState.piles} 
              maxTake={3}
              gameActive={false}
              onTake={() => {}}
            />
          </>
        );
      case 'nim-game':
        return (
          <div className="flex flex-col items-center">
            <div className="text-center mb-10">
              <h2 className="text-[120px] md:text-[180px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-hextech-blue to-hextech-blue/20 drop-shadow-[0_0_25px_rgba(10,200,185,0.4)]">
                {gameState.stones}
              </h2>
              <div className="text-hextech-gold-light mt-2 text-xl tracking-widest uppercase font-bold">Stones Remaining</div>
            </div>
          </div>
        );
      case 'tic-tac-toe':
        return (
          <div className="flex flex-col items-center w-full max-w-4xl mx-auto min-h-[400px] justify-center">
            <div className="relative mt-2 mb-10 w-fit">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 p-3 bg-[#050a0f] rounded-lg border border-hextech-gold/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-hextech-blue/5 via-transparent to-hextech-gold/5 pointer-events-none" />
                 <div className="absolute top-[33%] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hextech-border/30 to-transparent pointer-events-none" />
                 <div className="absolute top-[66%] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hextech-border/30 to-transparent pointer-events-none" />
                 <div className="absolute left-[33%] top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hextech-border/30 to-transparent pointer-events-none" />
                 <div className="absolute left-[66%] top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hextech-border/30 to-transparent pointer-events-none" />

                 {gameState.board.map((row: any[], r: number) => (
                    row.map((value: any, c: number) => {
                      const isWinningCell = gameState.winningLine?.some((p: any) => p.row === r && p.col === c);
                      const isNewestPiece = lastChange?.row === r && lastChange?.col === c;
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`
                            relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center text-5xl sm:text-7xl font-sans transition-all duration-300
                            border border-hextech-border/30 bg-hextech-dark/40 cursor-default
                            ${isWinningCell ? 'bg-hextech-gold/20 border-hextech-gold shadow-[0_0_20px_rgba(200,155,60,0.6)] z-10 scale-105' : ''}
                          `}
                        >
                          {value === 'Alice' && <span className="text-[#c89b3c] drop-shadow-[0_0_15px_rgba(200,155,60,0.8)]" style={{ animation: isNewestPiece ? 'ticTacToePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : 'none' }}>X</span>}
                          {value === 'Bob' && <span className="text-[#0ac8b9] drop-shadow-[0_0_15px_rgba(10,200,185,0.8)]" style={{ animation: isNewestPiece ? 'ticTacToePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : 'none' }}>O</span>}
                        </div>
                      );
                    })
                 ))}
              </div>
            </div>
          </div>
        );
      case 'connect-4':
        return (
          <div className="flex flex-col items-center w-full max-w-4xl mx-auto min-h-[400px] justify-center">
            <div className="relative mt-2 mb-10 w-fit">
              <div className={`
                grid grid-cols-7 grid-rows-6 gap-0 p-[2px] bg-hextech-dark/80 rounded border-2 border-hextech-blue/30 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden
              `}>
                 <div className="absolute inset-0 bg-gradient-to-br from-hextech-blue/5 via-transparent to-hextech-gold/5 pointer-events-none z-0" />
                 <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-hextech-blue/20 to-transparent pointer-events-none z-0" />

                 {gameState.board.map((row: any[], r: number) => (
                    row.map((value: any, c: number) => {
                      const isWinningCell = gameState.winningLine?.some((p: any) => p.row === r && p.col === c);
                      const isNewestPiece = lastChange?.row === r && lastChange?.col === c;
                      return (
                        <div
                          key={`${r}-${c}`}
                          className="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-hextech-dark/80"
                        >
                          <div className={`
                            absolute inset-0 bg-gradient-to-tr from-transparent to-hextech-blue/5 border border-hextech-border/30 z-0 pointer-events-none
                          `} />
                          
                          <div className={`
                            w-8 h-8 sm:w-12 sm:h-12 rounded-full relative z-10 
                            shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] 
                            transition-colors duration-300 transform
                            ${value === null ? 'bg-[#0a0f14]' : ''}
                            ${value === 'Alice' ? 'bg-[#c89b3c] shadow-[0_0_15px_rgba(200,155,60,0.5),inset_0_-3px_8px_rgba(0,0,0,0.4)]' : ''}
                            ${value === 'Bob' ? 'bg-[#0ac8b9] shadow-[0_0_15px_rgba(10,200,185,0.5),inset_0_-3px_8px_rgba(0,0,0,0.4)]' : ''}
                            ${value !== null && isWinningCell ? '!shadow-[0_0_25px_rgba(255,255,255,0.8),inset_0_-3px_8px_rgba(0,0,0,0.4)] ring-4 ring-white animate-pulse z-20 scale-110' : ''}
                          `} style={{
                              animation: isNewestPiece ? 'connect4Drop 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none'
                          }} />
                        </div>
                      );
                    })
                 ))}
              </div>
              <div className="h-6 w-full bg-gradient-to-b from-hextech-blue/20 to-transparent rounded-bl-xl rounded-br-xl flex justify-between px-4 pb-2 z-[-1] absolute -bottom-6">
                  <div className="w-6 h-full bg-gradient-to-b from-hextech-blue/40 to-transparent rounded-b" />
                  <div className="w-6 h-full bg-gradient-to-b from-hextech-blue/40 to-transparent rounded-b" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const formatTitle = (id: string) => {
    return id.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') + ' Replay';
  };

  const board = (
    <div className="flex flex-col items-center w-full">
      <style>{`
        @keyframes connect4Drop {
          0% { transform: translateY(-400px); opacity: 0; }
          10% { opacity: 1; }
          60% { transform: translateY(15px); }
          80% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        @keyframes ticTacToePop {
          0% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
      {/* Playback Controls */}
      <div className="bg-hextech-dark/80 border border-hextech-blue/40 px-6 py-4 mb-8 flex items-center gap-6 shadow-lg shadow-hextech-blue/10 backdrop-blur-md w-full max-w-2xl rounded-sm">
        <button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={isPlaying || currentStep === 0}
          className="text-hextech-gold hover:text-hextech-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <SkipBack size={24} />
        </button>

        <button 
          onClick={() => {
            if (currentStep === states.length - 1) {
              setCurrentStep(0);
              setIsPlaying(true);
            } else {
              setIsPlaying(!isPlaying);
            }
          }}
          className="w-14 h-14 flex items-center justify-center bg-hextech-blue/10 border border-hextech-blue text-hextech-blue hover:bg-hextech-blue/20 transition-all rounded-full shadow-[0_0_15px_rgba(10,200,185,0.2)] hover:shadow-[0_0_25px_rgba(10,200,185,0.4)] hover:scale-105 cursor-pointer"
        >
          {currentStep === states.length - 1 ? (
             <RotateCcw size={24} />
          ) : isPlaying ? (
             <Pause size={24} />
          ) : (
             <Play size={24} className="ml-1" />
          )}
        </button>

        <button 
          onClick={() => setCurrentStep(Math.min(states.length - 1, currentStep + 1))}
          disabled={isPlaying || currentStep === states.length - 1}
          className="text-hextech-gold hover:text-hextech-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <SkipForward size={24} />
        </button>

        <div className="flex-1 flex flex-col ml-4">
          <span className="text-xs text-hextech-blue uppercase tracking-widest font-bold mb-2">
            Turn {currentStep} / {states.length - 1}
          </span>
          <input 
            type="range" 
            min="0" 
            max={states.length - 1} 
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(parseInt(e.target.value));
            }}
            className="w-full h-1 bg-hextech-border appearance-none rounded-none accent-hextech-blue cursor-pointer outline-none"
          />
        </div>
      </div>

      {/* Board View */}
      <div className="w-full relative">
        {/* Overlay to absolutely prevent any interaction in replay mode */}
        <div className="absolute inset-0 z-50 pointer-events-auto" />
        {renderBoard()}
      </div>
    </div>
  );

  return (
    <GameLayout title={formatTitle(gameId)}>
      <GameContentGrid
        board={board}
        scores={gameState.scores}
        showScore={gameId !== 'nim-game' && gameId !== 'tic-tac-toe' && gameId !== 'connect-4'}
        currentPlayer={gameState.currentPlayer}
        gameOver={gameState.gameOver}
        winner={engine.getResult(gameState)}
        history={gameState.history}
        isReplay={true}
      />
    </GameLayout>
  );
}
