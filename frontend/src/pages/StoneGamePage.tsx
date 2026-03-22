import { useState, useEffect, useMemo } from 'react';
import { StoneGameEngine } from '../games/StoneGameEngine';
import type { StoneGameState } from '../games/StoneGameEngine';
import PileRow from '../components/PileRow';
import GameLayout from '../components/GameLayout';
import GameSetup from '../components/GameSetup';
import PredictionBanner, { OracleToggle } from '../components/PredictionBanner';
import { games } from '../data/games';
import { analysisService } from '../services/analysisService';

export default function StoneGamePage() {
  const [inputVal, setInputVal] = useState('5, 3, 4, 5');
  const [gameState, setGameState] = useState<StoneGameState | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  
  const engine = useMemo(() => new StoneGameEngine(), []);

  useEffect(() => {
    if (!showPrediction || !gameState || gameState.gameOver) {
      setPrediction(null);
      return;
    }

    let active = true;
    analysisService.analyze('stone-game-1', gameState).then((res: any) => {
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
      let active = true;
      const timer = setTimeout(() => {
        analysisService.getBestMove('stone-game-1', gameState).then(move => {
          if (active && move) {
            setGameState(prev => prev ? engine.applyMove(prev, move) : null);
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
      title="Stone Game"
      isGameActive={gameState !== null}
      scores={gameState?.scores}
      currentPlayer={gameState?.currentPlayer}
      gameOver={gameState?.gameOver}
      winner={gameState ? engine.getResult(gameState) : null}
      history={gameState?.history}
      replayData={gameState?.gameOver ? {
        gameId: 'stone-game-1',
        initialConfig: inputVal,
        moves: gameState.history.map(h => h.move)
      } : undefined}
      onReset={() => {
        setGameState(null);
        setShowPrediction(false);
      }}
      setupContent={
        <GameSetup
          description={games.find(g => g.id === 'stone-game-1')?.description || ''}
          rules={games.find(g => g.id === 'stone-game-1')?.rules || ''}
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
        <div className="flex flex-col w-full max-w-4xl mx-auto game-anim">
          {!gameState.gameOver && (
            showPrediction ? (
              <PredictionBanner 
                winner={prediction?.winner as string} 
                optimalMove={prediction?.optimalMove} 
                scoreDiff={prediction?.scoreDiff} 
                onClose={() => setShowPrediction(false)}
              />
            ) : (
              <OracleToggle onClick={() => setShowPrediction(true)} />
            )
          )}

          <PileRow 
            piles={gameState.piles} 
            gameActive={!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')}
            onTakeLeft={handleTakeLeft}
            onTakeRight={handleTakeRight}
            highlightLeft={showPrediction && prediction?.optimalMove === 'left'}
            highlightRight={showPrediction && prediction?.optimalMove === 'right'}
          />
        </div>
      )}
    </GameLayout>
  );
}
