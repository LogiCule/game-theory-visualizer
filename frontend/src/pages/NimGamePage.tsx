import { useState, useEffect, useMemo } from 'react';
import { NimGameEngine } from '../games/NimGameEngine';
import { applyMoveWithExplanation } from '../games/explainerUtility';
import type { NimState } from '../games/NimGameEngine';
import GameLayout from '../components/GameLayout';
import GameContentGrid from '../components/GameContentGrid';
import GameSetup from '../components/GameSetup';
import PredictionBanner, { OracleToggle } from '../components/PredictionBanner';
import { games } from '../data/games';
import { analysisService, loadDifficulty, saveDifficulty } from '../services/analysisService';
import type { AIDifficulty } from '../ai/AIStrategy';

export default function NimGamePage() {
  const [inputVal, setInputVal] = useState('10');
  const [gameState, setGameState] = useState<NimState | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const [difficulty, setDifficulty] = useState<AIDifficulty>(loadDifficulty);
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const engine = useMemo(() => new NimGameEngine(), []);

  useEffect(() => {
    if (!showPrediction || !gameState || gameState.gameOver) { setPrediction(null); return; }
    let active = true;
    analysisService.analyze('nim-game', gameState, difficulty).then((res: any) => { if (active) setPrediction(res); });
    return () => { active = false; };
  }, [showPrediction, gameState]);

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
    setShowPrediction(false);
    saveDifficulty(difficulty);
  };

  const handleTake = (count: 1 | 2 | 3) => {
    if (gameState && !gameState.gameOver && engine.isValidMove(gameState, count)) {
      setGameState(applyMoveWithExplanation(engine, gameState, count, 'nim-game', prediction || undefined));
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      let active = true;
      const timer = setTimeout(() => {
        analysisService.getBestMove('nim-game', gameState, difficulty).then(move => {
          if (active && move !== null) {
            setGameState(prev => prev ? applyMoveWithExplanation(engine, prev, move, 'nim-game', prediction || undefined, difficulty) : null);
          }
        });
      }, 1000);
      return () => { active = false; clearTimeout(timer); };
    }
  }, [gameState, gameMode, engine]);

  const stonesLeft = gameState?.stones || 0;
  const gameActive = gameState ? (!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')) : false;

  const board = gameState && (
    <div className="flex flex-col items-center gap-8 w-full max-w-[500px] mx-auto">
      <div className="text-center relative">
        <h2 className="text-[120px] md:text-[180px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-hextech-blue to-hextech-blue/20 drop-shadow-[0_0_25px_rgba(10,200,185,0.4)]">
          {stonesLeft}
        </h2>
        <div className="text-hextech-gold-light mt-2 text-xl tracking-widest uppercase font-bold">Stones Remaining</div>
      </div>

      <div className="flex gap-4 md:gap-6 justify-center">
        {[1, 2, 3].map(take => {
          const takes = take as 1 | 2 | 3;
          const isSelectable = gameActive && stonesLeft >= takes;
          const isOptimal = showPrediction && prediction?.optimalMove === takes;
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
                ${isOptimal ? 'animate-pulse ring-2 ring-hextech-blue shadow-[0_0_20px_rgba(10,200,185,0.6)] !border-hextech-blue !text-hextech-blue' : ''}
              `}
              style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-tr from-hextech-gold/10 to-transparent opacity-0 transition-opacity duration-300 ${isSelectable && !isOptimal ? 'hover:opacity-100' : ''}`} />
              <span className="relative z-10 drop-shadow-md">Take {take}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const boardControls = gameState && !gameState.gameOver && (
    showPrediction ? (
      <PredictionBanner winner={prediction?.winner as string} optimalMove={prediction?.optimalMove} onClose={() => setShowPrediction(false)} />
    ) : (
      <OracleToggle onClick={() => setShowPrediction(true)} />
    )
  );

  return (
    <GameLayout title="Nim Game">
      {!gameState ? (
        <GameSetup
          description={games.find(g => g.id === 'nim-game')?.description || ''}
          rules={games.find(g => g.id === 'nim-game')?.rules || ''}
          placeholder="e.g. 10"
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
          showScore={false}
          currentPlayer={gameState.currentPlayer}
          gameOver={gameState.gameOver}
          winner={engine.getResult(gameState)}
          gameMode={gameMode}
          difficulty={difficulty}
          history={gameState.history}
          onReset={() => { setGameState(null); setShowPrediction(false); }}
          replayData={gameState.gameOver ? {
            gameId: 'nim-game',
            initialConfig: inputVal,
            history: gameState.history,
          } : undefined}
        />
      )}
    </GameLayout>
  );
}
