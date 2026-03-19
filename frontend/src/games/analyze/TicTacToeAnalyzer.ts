import type { GameAnalyzer, GameAnalysis } from '../core/GameAnalyzer';
import type { TicTacToeState, TicTacToeMove } from '../TicTacToeEngine';
import { TicTacToeEngine } from '../TicTacToeEngine';

export class TicTacToeAnalyzer implements GameAnalyzer<TicTacToeState, TicTacToeMove> {
  private engine = new TicTacToeEngine();

  analyze(state: TicTacToeState): GameAnalysis<TicTacToeMove> {
    if (this.engine.isTerminal(state)) {
       const res = this.engine.getResult(state);
       return { winner: res || 'Tie' };
    }
    
    let bestScore = -Infinity;
    let bestMove: TicTacToeMove | undefined;
    const maximizingPlayer = state.currentPlayer;
    const validMoves = this.engine.getValidMoves(state);

    if (validMoves.length === 9) {
      bestMove = { row: 1, col: 1 };
      bestScore = 0; 
    } else {
      for (const move of validMoves) {
        const nextState = this.engine.applyMove(state, move);
        const score = this.engine.minimax(nextState, maximizingPlayer, 0);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
    
    let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
    if (bestScore > 0) winner = maximizingPlayer;
    else if (bestScore < 0) winner = maximizingPlayer === 'Alice' ? 'Bob' : 'Alice';

    return {
      winner,
      optimalMove: bestMove
    };
  }
}
