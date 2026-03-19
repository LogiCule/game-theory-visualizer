import { useState, useEffect, useMemo } from 'react';
import { Connect4Engine } from '../games/Connect4Engine';
import type { Connect4State } from '../games/Connect4Engine';
import type { Player } from '../games/core/TwoPlayerGameEngine';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';
import PredictionBanner, { OracleToggle } from '../components/PredictionBanner';
import { games } from '../data/games';
import { analysisService } from '../services/analysisService';

export default function Connect4Page() {
  const [gameState, setGameState] = useState<Connect4State | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const [showPrediction, setShowPrediction] = useState(false);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<{row: number, col: number} | null>(null);
  const [hint, setHint] = useState<{col: number} | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  
  const engine = useMemo(() => new Connect4Engine(), []);

  useEffect(() => {
    if (!showPrediction || !gameState || gameState.gameOver) {
      setPrediction(null);
      return;
    }

    let active = true;
    analysisService.analyze('connect-4', gameState).then((res: any) => {
      if (active) {
        setPrediction(res);
      }
    });

    return () => {
      active = false;
    };
  }, [showPrediction, gameState]);

  const startGame = () => {
    setGameState(engine.getInitialState());
    setShowPrediction(false);
    setLastMove(null);
    setHint(null);
  };

  const getTargetRow = (board: (Player | null)[][], c: number) => {
    for (let r = 5; r >= 0; r--) {
      if (board[r][c] === null) return r;
    }
    return -1;
  };

  const handleCellClick = (c: number) => {
    if (gameState && !gameState.gameOver && engine.isValidMove(gameState, { col: c })) {
      const targetRow = getTargetRow(gameState.board, c);
      setGameState(engine.applyMove(gameState, { col: c }));
      setLastMove({ row: targetRow, col: c });
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      let active = true;
      setHint(null);
      const timer = setTimeout(() => {
        analysisService.getBestMove('connect-4', gameState, (progress) => {
          if (active) setHint(progress.result);
        }).then(move => {
          if (active && move) {
            setHint(null);
            const targetRow = getTargetRow(gameState.board, move.col);
            setGameState(prev => prev ? engine.applyMove(prev, move) : null);
            setLastMove({ row: targetRow, col: move.col });
          }
        });
      }, 500); 
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [gameState, gameMode, engine]);

  const gameActive = gameState ? (!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')) : false;

  const renderCell = (r: number, c: number) => {
    if (!gameState) return null;
    const value = gameState.board[r][c];
    
    // Check if part of winning line
    const isWinningCell = gameState.winningLine?.some(p => p.row === r && p.col === c);
    const isNewestPiece = lastMove?.row === r && lastMove?.col === c;

    return (
      <div
        key={`${r}-${c}`}
        className="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-hextech-dark/80"
        onMouseEnter={() => gameActive && setHoverCol(c)}
        onMouseLeave={() => setHoverCol(null)}
        onClick={() => handleCellClick(c)}
      >
        <div className={`
          absolute inset-0 bg-gradient-to-tr from-transparent to-hextech-blue/5 border border-hextech-border/30 z-0 pointer-events-none
          ${hoverCol === c && gameActive ? 'bg-hextech-blue/10 border-hextech-blue/50' : ''}
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
  };

  return (
    <GameLayout
      title="Connect 4"
      isGameActive={gameState !== null}
      scores={gameState?.scores}
      showScore={true}
      currentPlayer={gameState?.currentPlayer}
      gameOver={gameState?.gameOver}
      winner={gameState ? engine.getResult(gameState) : null}
      history={gameState?.history}
      replayData={gameState?.gameOver ? {
        gameId: 'connect-4',
        initialConfig: '',
        moves: gameState.history.map(h => h.move)
      } : undefined}
      onReset={() => {
        setGameState(null);
        setShowPrediction(false);
        setLastMove(null);
      }}
      setupContent={
        <GameSetup
          title="Initialize Match"
          description={games.find(g => g.id === 'connect-4')?.description || ''}
          rules={games.find(g => g.id === 'connect-4')?.rules || ''}
          gameMode={gameMode}
          setGameMode={setGameMode}
          onStart={startGame}
          hideInput={true}
        />
      }
    >
      <style>{`
        @keyframes connect4Drop {
          0% { transform: translateY(-400px); opacity: 0; }
          10% { opacity: 1; }
          60% { transform: translateY(15px); }
          80% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
      `}</style>

      {gameState && (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto game-anim">
          {!gameState.gameOver && (
            showPrediction ? (
              <PredictionBanner 
                winner={prediction?.winner as string} 
                optimalMove={prediction?.optimalMove ? `Drop Col ${prediction.optimalMove.col + 1}` : undefined} 
                scoreDiff={prediction?.scoreDiff}
                onClose={() => setShowPrediction(false)}
              />
            ) : (
              <OracleToggle onClick={() => setShowPrediction(true)} />
            )
          )}

          <div className="relative mt-2 mb-10 w-fit">
            
            {/* Column indicators for optimal move / hover / hint */}
            <div className="flex justify-between w-full absolute -top-10 left-0 right-0 h-8 pointer-events-none z-20">
                {Array.from({ length: 7 }).map((_, c) => {
                   const isOptimal = showPrediction && prediction?.optimalMove?.col === c;
                   const isHint = hint?.col === c;
                   return (
                     <div key={c} className="w-10 sm:w-16 flex items-end justify-center h-full">
                        <div className={`
                          w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-l-transparent border-r-transparent transition-all duration-300
                          ${isOptimal ? 'border-t-hextech-blue drop-shadow-[0_0_12px_rgba(10,200,185,0.8)] animate-bounce' : 'border-t-transparent'}
                          ${isHint && !isOptimal ? 'border-t-[#0ac8b9] animate-pulse opacity-70' : ''}
                          ${hoverCol === c && gameActive && !isOptimal && !isHint ? 'border-t-hextech-gold/80' : ''}
                        `} />
                     </div>
                   )
                })}
            </div>

            <div className={`
              grid grid-cols-7 grid-rows-6 gap-0 p-[2px] bg-hextech-dark/80 rounded border-2 border-hextech-blue/30 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden
              ${gameActive ? 'cursor-pointer' : ''}
            `}>
               {/* Background visual flair */}
               <div className="absolute inset-0 bg-gradient-to-br from-hextech-blue/5 via-transparent to-hextech-gold/5 pointer-events-none z-0" />
               <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-hextech-blue/20 to-transparent pointer-events-none z-0" />

               {gameState.board.map((row, r) => (
                  row.map((_, c) => renderCell(r, c))
               ))}
            </div>
            
            {/* Base legs graphics */}
            <div className="h-6 w-full bg-gradient-to-b from-hextech-blue/20 to-transparent rounded-bl-xl rounded-br-xl flex justify-between px-4 pb-2 z-[-1]">
                <div className="w-6 h-full bg-gradient-to-b from-hextech-blue/40 to-transparent rounded-b" />
                <div className="w-6 h-full bg-gradient-to-b from-hextech-blue/40 to-transparent rounded-b" />
            </div>
            
          </div>
        </div>
      )}
    </GameLayout>
  );
}
