import type { GameAnalyzer, GameAnalysis } from '../core/GameAnalyzer';
import type { Connect4State, Connect4Move } from '../Connect4Engine';
import { Connect4Engine } from '../Connect4Engine';

export class Connect4Analyzer implements GameAnalyzer<Connect4State, Connect4Move> {
  private engine = new Connect4Engine();
  private readonly SEARCH_DEPTH = 6; // Deep enough for strong tactical predictions, fast enough for seamless UI

  analyze(state: Connect4State): GameAnalysis<Connect4Move> {
    if (this.engine.isTerminal(state)) {
       const res = this.engine.getResult(state);
       return { winner: res || 'Tie' };
    }
    
    let bestScore = -Infinity;
    let bestMove: Connect4Move | undefined;
    const maximizingPlayer = state.currentPlayer;
    const validMoves = this.engine.getValidMoves(state);

    if (validMoves.length === 7 && state.history.length === 0) {
      bestMove = { col: 3 };
      bestScore = 1; // Slight edge for first player center
    } else {
      for (const move of validMoves) {
        const nextState = this.engine.applyMove(state, move);
        const score = this.engine.minimax(nextState, this.SEARCH_DEPTH - 1, -Infinity, Infinity, maximizingPlayer);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
    
    let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
    if (bestScore > 80000) winner = maximizingPlayer;
    else if (bestScore < -80000) winner = maximizingPlayer === 'Alice' ? 'Bob' : 'Alice';
    // If neither is strictly winning within the depth limit, we return 'Tie' to indicate a neutral/undecided board.
    
    return {
      winner,
      optimalMove: bestMove,
      scoreDiff: Math.round(bestScore) // Expose heuristic edge
    };
  }
}
