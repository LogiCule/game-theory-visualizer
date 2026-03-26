import { useState, useEffect, useMemo } from 'react';
import { TicTacToeEngine } from '../games/TicTacToeEngine';
import { applyMoveWithExplanation } from '../games/explainerUtility';
import type { TicTacToeState } from '../games/TicTacToeEngine';
import GameLayout from '../components/GameLayout';
import GameContentGrid from '../components/GameContentGrid';
import GameSetup from '../components/GameSetup';
import PredictionBanner, { OracleToggle } from '../components/PredictionBanner';
import { games } from '../data/games';
import { analysisService, loadDifficulty, saveDifficulty } from '../services/analysisService';
import type { AIDifficulty } from '../ai/AIStrategy';

export default function TicTacToePage() {
  const [gameState, setGameState] = useState<TicTacToeState | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const [difficulty, setDifficulty] = useState<AIDifficulty>(loadDifficulty);
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const engine = useMemo(() => new TicTacToeEngine(), []);

  useEffect(() => {
    if (!showPrediction || !gameState || gameState.gameOver) {
      setPrediction(null);
      return;
    }
    let active = true;
    analysisService.analyze('tic-tac-toe', gameState, difficulty).then((res: any) => {
      if (active) setPrediction(res);
    });
    return () => { active = false; };
  }, [showPrediction, gameState]);

  const startGame = () => {
    setGameState(engine.getInitialState());
    setShowPrediction(false);
    saveDifficulty(difficulty);
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameState && !gameState.gameOver && engine.isValidMove(gameState, { row: r, col: c })) {
      setGameState(applyMoveWithExplanation(engine, gameState, { row: r, col: c }, 'tic-tac-toe', prediction || undefined));
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      let active = true;
      const timer = setTimeout(() => {
        analysisService.getBestMove('tic-tac-toe', gameState, difficulty).then(move => {
          if (active && move) {
            setGameState(prev => prev ? applyMoveWithExplanation(engine, prev, move, 'tic-tac-toe', prediction || undefined, difficulty) : null);
          }
        });
      }, 500);
      return () => { active = false; clearTimeout(timer); };
    }
  }, [gameState, gameMode, engine]);

  const gameActive = gameState ? (!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')) : false;

  const renderCell = (r: number, c: number) => {
    if (!gameState) return null;
    const value = gameState.board[r][c];
    const isSelectable = gameActive && value === null;
    const isWinningCell = gameState.winningLine?.some(p => p.row === r && p.col === c);
    const isOptimal = showPrediction && prediction?.optimalMove?.row === r && prediction?.optimalMove?.col === c;

    const rowNames = ['Top', 'Center', 'Bottom'];
    const colNames = ['Left', 'Center', 'Right'];

    return (
      <button
        key={`${r}-${c}`}
        disabled={!isSelectable}
        onClick={() => handleCellClick(r, c)}
        title={`${rowNames[r]} ${colNames[c]}`}
        className={`
          relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center text-5xl sm:text-7xl font-sans transition-all duration-300
          border border-hextech-border/30 bg-hextech-dark/40
          ${isSelectable ? 'hover:bg-hextech-blue/10 cursor-pointer hover:border-hextech-blue/50' : 'cursor-default'}
          ${isWinningCell ? 'bg-hextech-gold/20 border-hextech-gold shadow-[0_0_20px_rgba(200,155,60,0.6)] z-10 scale-105' : ''}
          ${isOptimal ? 'animate-pulse ring-2 ring-hextech-blue shadow-[0_0_20px_rgba(10,200,185,0.6)] !border-hextech-blue !bg-hextech-blue/10 z-10' : ''}
        `}
      >
        {value === 'Alice' && <span className="text-[#c89b3c] drop-shadow-[0_0_15px_rgba(200,155,60,0.8)] animate-pulse">X</span>}
        {value === 'Bob' && <span className="text-[#0ac8b9] drop-shadow-[0_0_15px_rgba(10,200,185,0.8)] animate-pulse">O</span>}
      </button>
    );
  };

  const getOracleMoveText = () => {
    if (!prediction?.optimalMove) return undefined;
    const rowNames = ['Top', 'Center', 'Bot'];
    const colNames = ['Left', 'Center', 'Right'];
    return `${rowNames[prediction.optimalMove.row]} ${colNames[prediction.optimalMove.col]}`;
  };

  // Board JSX
  const board = gameState && (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto">
      <div className="grid grid-cols-3 grid-rows-3 gap-2 p-3 bg-[#050a0f] rounded-lg border border-hextech-gold/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-hextech-blue/5 via-transparent to-hextech-gold/5 pointer-events-none" />
        <div className="absolute top-[33%] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hextech-border/30 to-transparent pointer-events-none" />
        <div className="absolute top-[66%] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hextech-border/30 to-transparent pointer-events-none" />
        <div className="absolute left-[33%] top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hextech-border/30 to-transparent pointer-events-none" />
        <div className="absolute left-[66%] top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-hextech-border/30 to-transparent pointer-events-none" />
        {gameState.board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
      </div>
    </div>
  );

  // Oracle controls — shown above board
  const boardControls = gameState && !gameState.gameOver && (
    showPrediction ? (
      <PredictionBanner
        winner={prediction?.winner as string}
        optimalMove={getOracleMoveText()}
        onClose={() => setShowPrediction(false)}
      />
    ) : (
      <OracleToggle onClick={() => setShowPrediction(true)} />
    )
  );

  return (
    <GameLayout title="Tic Tac Toe">
      {!gameState ? (
        <GameSetup
          title="Initialize Match"
          description={games.find(g => g.id === 'tic-tac-toe')?.description || ''}
          rules={games.find(g => g.id === 'tic-tac-toe')?.rules || ''}
          gameMode={gameMode}
          setGameMode={setGameMode}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStart={startGame}
          hideInput={true}
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
            gameId: 'tic-tac-toe',
            initialConfig: '',
            history: gameState.history,
            gameMode,
            difficulty,
          } : undefined}
        />
      )}
    </GameLayout>
  );
}
