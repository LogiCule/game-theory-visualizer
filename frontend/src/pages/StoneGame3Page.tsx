import { useState, useEffect, useMemo } from 'react';
import { StoneGame3Engine } from '../games/StoneGame3Engine';
import type { StoneGame3State } from '../games/StoneGame3Engine';
import FrontTakeRow from '../components/FrontTakeRow';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';
import { games } from '../data/games';
import PredictionBanner, { OracleToggle } from '../components/PredictionBanner';
import { getAnalyzerForGame } from '../games/analyzerRegistry';

export default function StoneGame3Page() {
  const [inputVal, setInputVal] = useState('1, 2, 3, 7');
  const [gameState, setGameState] = useState<StoneGame3State | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const [showPrediction, setShowPrediction] = useState(false);
  
  const engine = useMemo(() => new StoneGame3Engine(), []);
  const analyzer = useMemo(() => getAnalyzerForGame('stone-game-3'), []);

  const prediction = useMemo(() => {
    if (!showPrediction || !gameState || gameState.gameOver || !analyzer) return null;
    return analyzer.analyze(gameState);
  }, [showPrediction, gameState, analyzer]);

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
    setShowPrediction(false);
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
      winner={gameState ? engine.getResult(gameState) : null}
      history={gameState?.history}
      replayData={gameState?.gameOver ? {
        gameId: 'stone-game-3',
        initialConfig: inputVal,
        moves: gameState.history.map(h => h.move)
      } : undefined}
      onReset={() => {
        setGameState(null);
        setShowPrediction(false);
      }}
      setupContent={
        <GameSetup
          description={games.find(g => g.id === 'stone-game-3')?.description || ''}
          rules={games.find(g => g.id === 'stone-game-3')?.rules || ''}
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
        <div className="flex flex-col w-full max-w-4xl mx-auto game-anim">
          {!gameState.gameOver && (
            showPrediction ? (
              <PredictionBanner 
                winner={prediction?.winner as string} 
                optimalMove={`Take ${prediction?.optimalMove}`} 
                scoreDiff={prediction?.scoreDiff} 
                onClose={() => setShowPrediction(false)}
              />
            ) : (
              <OracleToggle onClick={() => setShowPrediction(true)} />
            )
          )}

          <FrontTakeRow
            piles={gameState.piles}
            maxTake={3}
            gameActive={!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')}
            onTake={handleTake}
            optimalMove={showPrediction ? (prediction?.optimalMove as number | undefined) : undefined}
          />
        </div>
      )}
    </GameLayout>
  );
}
