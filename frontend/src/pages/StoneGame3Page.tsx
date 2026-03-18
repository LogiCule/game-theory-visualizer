import { useState, useEffect, useMemo } from 'react';
import { StoneGame3Engine } from '../games/StoneGame3Engine';
import type { StoneGame3State } from '../games/StoneGame3Engine';
import FrontTakeRow from '../components/FrontTakeRow';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';

export default function StoneGame3Page() {
  const [inputVal, setInputVal] = useState('1, 2, 3, 7');
  const [gameState, setGameState] = useState<StoneGame3State | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  
  const engine = useMemo(() => new StoneGame3Engine(), []);

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
  };

  const handleTake = (count: number) => {
    if (gameState && !gameState.gameOver) {
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

  return (
    <GameLayout
      title="Stone Game III"
      isGameActive={gameState !== null}
      scores={gameState?.scores}
      currentPlayer={gameState?.currentPlayer}
      gameOver={gameState?.gameOver}
      winner={gameState ? (engine.getWinner(gameState) as 'Alice' | 'Bob' | 'Draw' | null) : null}
      history={gameState?.history}
      onReset={() => setGameState(null)}
      setupContent={
        <GameSetup
          description="Deploy the initial sequence of stones."
          placeholder="1, 2, 3, 7"
          inputVal={inputVal}
          setInputVal={setInputVal}
          gameMode={gameMode}
          setGameMode={setGameMode}
          onStart={startGame}
        />
      }
    >
      {gameState && (
        <>
          <div className="text-center mb-6 text-hextech-blue font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(10,200,185,0.5)]">
            Max Take: 3 Stones
          </div>
          <FrontTakeRow 
            piles={gameState.piles} 
            maxTake={3}
            gameActive={!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')}
            onTake={handleTake}
          />
        </>
      )}
    </GameLayout>
  );
}
