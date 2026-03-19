import { useState, useEffect, useMemo } from 'react';
import { StoneGame2Engine } from '../games/StoneGame2Engine';
import type { StoneGame2State } from '../games/StoneGame2Engine';
import FrontTakeRow from '../components/FrontTakeRow';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';
import { games } from '../data/games';

export default function StoneGame2Page() {
  const [inputVal, setInputVal] = useState('2, 7, 9, 4, 4');
  const [gameState, setGameState] = useState<StoneGame2State | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  
  const engine = useMemo(() => new StoneGame2Engine(), []);

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
      title="Stone Game II"
      isGameActive={gameState !== null}
      scores={gameState?.scores}
      currentPlayer={gameState?.currentPlayer}
      gameOver={gameState?.gameOver}
      winner={gameState ? engine.getResult(gameState) : null}
      history={gameState?.history}
      replayData={gameState?.gameOver ? {
        gameId: 'stone-game-2',
        initialConfig: inputVal,
        moves: gameState.history.map(h => h.move)
      } : undefined}
      onReset={() => setGameState(null)}
      setupContent={
        <GameSetup
          description={games.find(g => g.id === 'stone-game-2')?.description || ''}
          rules={games.find(g => g.id === 'stone-game-2')?.rules || ''}
          placeholder="2, 7, 9, 4, 4"
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
            Current Multiplier (M): {gameState.M} &nbsp;&mdash;&nbsp; Max Take: {2 * gameState.M}
          </div>
          <FrontTakeRow 
            piles={gameState.piles} 
            maxTake={2 * gameState.M}
            gameActive={!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')}
            onTake={handleTake}
          />
        </>
      )}
    </GameLayout>
  );
}
