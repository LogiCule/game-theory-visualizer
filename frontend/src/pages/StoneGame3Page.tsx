import { useState, useEffect, useMemo } from 'react';
import { StoneGame3Engine } from '../games/StoneGame3Engine';
import { applyMoveWithExplanation } from '../games/explainerUtility';
import type { StoneGame3State } from '../games/StoneGame3Engine';
import FrontTakeRow from '../components/FrontTakeRow';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';
import { games } from '../data/games';
import PredictionBanner, { OracleToggle } from '../components/PredictionBanner';
import { analysisService } from '../services/analysisService';

export default function StoneGame3Page() {
  const [inputVal, setInputVal] = useState('1, 2, 3, 7');
  const [gameState, setGameState] = useState<StoneGame3State | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  
  const engine = useMemo(() => new StoneGame3Engine(), []);

  useEffect(() => {
    if (!showPrediction || !gameState || gameState.gameOver) {
      setPrediction(null);
      return;
    }

    let active = true;
    analysisService.analyze('stone-game-3', gameState).then((res: any) => {
      if (active) {
        setPrediction(res);
      }
    });

    return () => {
      active = false;
    };
  }, [showPrediction, gameState]);

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
    setShowPrediction(false);
  };

  const handleTake = (count: number) => {
    if (gameState && !gameState.gameOver) {
      setGameState(applyMoveWithExplanation(engine, gameState, count, 'stone-game-3', prediction || undefined));
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      let active = true;
      const timer = setTimeout(() => {
        analysisService.getBestMove('stone-game-3', gameState).then(move => {
          if (active && move !== null) {
            setGameState(prev => prev ? applyMoveWithExplanation(engine, prev, move, 'stone-game-3', prediction || undefined) : null);
          }
        });
      }, 1000);
      return () => {
        active = false;
        clearTimeout(timer);
      };
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
