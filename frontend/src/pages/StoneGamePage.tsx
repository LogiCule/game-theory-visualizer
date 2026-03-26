import { useState, useEffect, useMemo } from 'react';
import { StoneGameEngine } from '../games/StoneGameEngine';
import { applyMoveWithExplanation } from '../games/explainerUtility';
import type { StoneGameState } from '../games/StoneGameEngine';
import PileRow from '../components/PileRow';
import GameLayout from '../components/GameLayout';
import GameContentGrid from '../components/GameContentGrid';
import GameSetup from '../components/GameSetup';
import PredictionBanner, { OracleToggle } from '../components/PredictionBanner';
import { games } from '../data/games';
import { analysisService, loadDifficulty, saveDifficulty } from '../services/analysisService';
import type { AIDifficulty } from '../ai/AIStrategy';

export default function StoneGamePage() {
  const [inputVal, setInputVal] = useState('5, 3, 4, 5');
  const [gameState, setGameState] = useState<StoneGameState | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const [difficulty, setDifficulty] = useState<AIDifficulty>(loadDifficulty);
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const engine = useMemo(() => new StoneGameEngine(), []);

  useEffect(() => {
    if (!showPrediction || !gameState || gameState.gameOver) { setPrediction(null); return; }
    let active = true;
    analysisService.analyze('stone-game-1', gameState, difficulty).then((res: any) => { if (active) setPrediction(res); });
    return () => { active = false; };
  }, [showPrediction, gameState]);

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
    setShowPrediction(false);
    saveDifficulty(difficulty);
  };

  const handleTakeLeft = () => {
    if (gameState && !gameState.gameOver) {
      setGameState(applyMoveWithExplanation(engine, gameState, 'left', 'stone-game-1', prediction || undefined));
    }
  };

  const handleTakeRight = () => {
    if (gameState && !gameState.gameOver) {
      setGameState(applyMoveWithExplanation(engine, gameState, 'right', 'stone-game-1', prediction || undefined));
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      let active = true;
      const timer = setTimeout(() => {
        analysisService.getBestMove('stone-game-1', gameState, difficulty).then(move => {
          if (active && move) {
            setGameState(prev => prev ? applyMoveWithExplanation(engine, prev, move, 'stone-game-1', prediction || undefined, difficulty) : null);
          }
        });
      }, 1000);
      return () => { active = false; clearTimeout(timer); };
    }
  }, [gameState, gameMode, engine]);

  const board = gameState && (
    <div className="w-full max-w-[600px] mx-auto">
      <PileRow
        piles={gameState.piles}
        gameActive={!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')}
        onTakeLeft={handleTakeLeft}
        onTakeRight={handleTakeRight}
        highlightLeft={showPrediction && prediction?.optimalMove === 'left'}
        highlightRight={showPrediction && prediction?.optimalMove === 'right'}
      />
    </div>
  );

  const boardControls = gameState && !gameState.gameOver && (
    showPrediction ? (
      <PredictionBanner winner={prediction?.winner as string} optimalMove={prediction?.optimalMove} scoreDiff={prediction?.scoreDiff} onClose={() => setShowPrediction(false)} />
    ) : (
      <OracleToggle onClick={() => setShowPrediction(true)} />
    )
  );

  return (
    <GameLayout title="Stone Game">
      {!gameState ? (
        <GameSetup
          description={games.find(g => g.id === 'stone-game-1')?.description || ''}
          rules={games.find(g => g.id === 'stone-game-1')?.rules || ''}
          placeholder="e.g. 5, 3, 4, 5"
          inputVal={inputVal}
          setInputVal={setInputVal}
          gameMode={gameMode}
          setGameMode={setGameMode}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStart={startGame}
        />
      ) : (
        <GameContentGrid
          board={board}
          boardControls={boardControls}
          scores={gameState.scores}
          currentPlayer={gameState.currentPlayer}
          gameOver={gameState.gameOver}
          winner={engine.getResult(gameState)}
          gameMode={gameMode}
          difficulty={difficulty}
          history={gameState.history}
          onReset={() => { setGameState(null); setShowPrediction(false); }}
          replayData={gameState.gameOver ? {
            gameId: 'stone-game-1',
            initialConfig: inputVal,
            history: gameState.history,
          } : undefined}
        />
      )}
    </GameLayout>
  );
}
