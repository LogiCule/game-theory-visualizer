import { useState, useEffect, useMemo } from 'react';
import { StoneGameEngine } from '../games/StoneGameEngine';
import type { StoneGameState } from '../games/StoneGameEngine';
import PileRow from '../components/PileRow';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';

export default function StoneGamePage() {
  const [inputVal, setInputVal] = useState('5, 3, 4, 5');
  const [gameState, setGameState] = useState<StoneGameState | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  
  const engine = useMemo(() => new StoneGameEngine(), []);

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
  };

  const handleTakeLeft = () => {
    if (gameState && !gameState.gameOver) {
      setGameState(engine.applyMove(gameState, 'left'));
    }
  };

  const handleTakeRight = () => {
    if (gameState && !gameState.gameOver) {
      setGameState(engine.applyMove(gameState, 'right'));
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      const timer = setTimeout(() => {
        const move = engine.getOptimalMove(gameState);
        if (move) {
          setGameState(prev => prev ? engine.applyMove(prev, move) : null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, gameMode, engine]);

  return (
    <GameLayout
      title="Stone Game"
      isGameActive={gameState !== null}
      scores={gameState?.scores}
      currentPlayer={gameState?.currentPlayer}
      gameOver={gameState?.gameOver}
      winner={gameState ? (engine.getWinner(gameState) as 'Alice' | 'Bob' | 'Draw' | null) : null}
      history={gameState?.history}
      onReset={() => setGameState(null)}
      setupContent={
        <GameSetup
          description="Deploy the initial sequence of stones, delineated by commas."
          placeholder="e.g. 5, 3, 4, 5"
          inputVal={inputVal}
          setInputVal={setInputVal}
          gameMode={gameMode}
          setGameMode={setGameMode}
          onStart={startGame}
        />
      }
    >
      {gameState && (
        <PileRow 
          piles={gameState.piles} 
          gameActive={!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')}
          onTakeLeft={handleTakeLeft}
          onTakeRight={handleTakeRight}
        />
      )}
    </GameLayout>
  );
}
