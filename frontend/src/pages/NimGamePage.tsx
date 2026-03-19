import { useState, useEffect, useMemo } from 'react';
import { NimGameEngine } from '../games/NimGameEngine';
import type { NimState } from '../games/NimGameEngine';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';
import { games } from '../data/games';

export default function NimGamePage() {
  const [inputVal, setInputVal] = useState('10');
  const [gameState, setGameState] = useState<NimState | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  
  const engine = useMemo(() => new NimGameEngine(), []);

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
  };

  const handleTake = (count: 1 | 2 | 3) => {
    if (gameState && !gameState.gameOver && engine.isValidMove(gameState, count)) {
      setGameState(engine.applyMove(gameState, count));
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      const timer = setTimeout(() => {
        const move = engine.getOptimalMove(gameState);
        if (move !== null) {
          setGameState(prev => prev ? engine.applyMove(prev, move) : null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, gameMode, engine]);

  const stonesLeft = gameState?.stones || 0;
  const gameActive = gameState ? (!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')) : false;

  return (
    <GameLayout
      title="Nim Game"
      isGameActive={gameState !== null}
      scores={gameState?.scores}
      showScore={false}
      currentPlayer={gameState?.currentPlayer}
      gameOver={gameState?.gameOver}
      winner={gameState ? engine.getResult(gameState) : null}
      history={gameState?.history}
      replayData={gameState?.gameOver ? {
        gameId: 'nim-game',
        initialConfig: inputVal,
        moves: gameState.history.map(h => h.move)
      } : undefined}
      onReset={() => setGameState(null)}
      setupContent={
        <GameSetup
          description={games.find(g => g.id === 'nim-game')?.description || ''}
          rules={games.find(g => g.id === 'nim-game')?.rules || ''}
          placeholder="e.g. 10"
          inputVal={inputVal}
          setInputVal={setInputVal}
          gameMode={gameMode}
          setGameMode={setGameMode}
          onStart={startGame}
        />
      }
    >
      {gameState && (
        <div className="flex flex-col items-center">
          <div className="text-center mb-10 relative">
            <h2 className="text-[120px] md:text-[180px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-hextech-blue to-hextech-blue/20 drop-shadow-[0_0_25px_rgba(10,200,185,0.4)]">
              {stonesLeft}
            </h2>
            <div className="text-hextech-gold-light mt-2 text-xl tracking-widest uppercase font-bold">Stones Remaining</div>
          </div>
          
          <div className="flex gap-4 md:gap-6 justify-center mt-6">
            {[1, 2, 3].map(take => {
              const takes = take as 1 | 2 | 3;
              const isSelectable = gameActive && stonesLeft >= takes;
              
              return (
                <button
                  key={take}
                  disabled={!isSelectable}
                  onClick={() => handleTake(takes)}
                  className={`
                    relative w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center
                    font-bold text-xl md:text-2xl transition-all duration-300 shadow-xl uppercase tracking-widest
                    ${isSelectable 
                      ? 'bg-hextech-panel border border-hextech-gold text-hextech-gold hover:text-hextech-gold-light hover:border-hextech-gold-light hover:bg-[#c89b3c]/10 hover:scale-[1.05] hover:-translate-y-2 cursor-pointer' 
                      : 'bg-hextech-dark/50 border border-hextech-border text-hextech-border cursor-not-allowed opacity-60'
                    }
                  `}
                  style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr from-hextech-gold/10 to-transparent opacity-0 transition-opacity duration-300 ${isSelectable ? 'hover:opacity-100' : ''}`} />
                  <span className="relative z-10 drop-shadow-md">Take {take}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameLayout>
  );
}
