import { getAnalyzerForGame } from '../games/analyzerRegistry';
import { getEngineForGame } from '../games/engineRegistry';
import { createStrategy, DIFFICULTY_CONFIGS } from '../ai/AIStrategy';
import type { AIDifficulty } from '../ai/AIStrategy';

// Connect-4 uses iterative deepening; depth sets per difficulty level
const CONNECT4_DEPTHS: Record<AIDifficulty, number[]> = {
  easy:   [2],
  medium: [3, 5],
  hard:   [3, 5, 7],
};

self.onmessage = async (event) => {
  const { requestId, gameId, state, type, difficulty = 'hard' } = event.data as {
    requestId: number;
    gameId: string;
    state: any;
    type: 'analyze' | 'bestMove';
    difficulty?: AIDifficulty;
  };

  let result = null;

  if (type === 'analyze') {
    const analyzer = getAnalyzerForGame(gameId);
    if (analyzer) {
      result = analyzer.analyze(state);
    }
    self.postMessage({ requestId, result, type });
    return;
  }

  if (type === 'bestMove') {
    const engine = getEngineForGame(gameId);
    if (!engine || !engine.getOptimalMove) {
      self.postMessage({ requestId, result: null, type });
      return;
    }

    if (gameId === 'connect-4') {
      const depths = CONNECT4_DEPTHS[difficulty];
      const config = DIFFICULTY_CONFIGS[difficulty];

      for (let i = 0; i < depths.length; i++) {
        const depth = depths[i];
        const isLast = i === depths.length - 1;

        let move = (engine as any).getOptimalMove(state, depth);

        // Apply randomness for easy/medium on the final (committed) move
        if (isLast && config.randomnessFactor > 0 && Math.random() < config.randomnessFactor) {
          const validMoves = engine.getValidMoves(state);
          if (validMoves.length > 0) {
            move = validMoves[Math.floor(Math.random() * validMoves.length)];
          }
        }

        self.postMessage({ requestId, result: move, depth, type: isLast ? type : 'progress' });
      }
    } else {
      // Generic path: use strategy layer
      const strategy = createStrategy(difficulty);
      result = strategy.selectMove(engine, state);
      self.postMessage({ requestId, result, type });
    }
  }
};
