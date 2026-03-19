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
    this.engine.clearMemo();
    let bestScore = -Infinity;
    let bestMove: Connect4Move | undefined;
    const maximizingPlayer = state.currentPlayer;
    const opponent = maximizingPlayer === 'Alice' ? 'Bob' : 'Alice';

    let isFull = true;
    for (let c = 0; c < 7; c++) {
      if (state.board[0][c] === null) { isFull = false; break; }
    }

    if (!isFull && state.history.length === 0) {
      bestMove = { col: 3 };
      bestScore = 1; // Slight edge for first player center
    } else {
      const board = state.board.map(row => [...row]);
      const order = [3, 2, 4, 1, 5, 0, 6];

      for (const col of order) {
        if (board[0][col] === null) {
          const row = this.engine.dropPiece(board, col, maximizingPlayer);
          const score = this.engine.minimaxInternal(board, this.SEARCH_DEPTH - 1, -Infinity, Infinity, opponent, maximizingPlayer, this.SEARCH_DEPTH);
          this.engine.removePiece(board, row, col);

          if (score > bestScore) {
            bestScore = score;
            bestMove = { col };
          }
        }
      }
    }
    
    let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
    if (bestScore > 80000) winner = maximizingPlayer;
    else if (bestScore < -80000) winner = opponent;
    // If neither is strictly winning within the depth limit, we return 'Tie' to indicate a neutral/undecided board.
    
    return {
      winner,
      optimalMove: bestMove,
      scoreDiff: Math.round(bestScore) // Expose heuristic edge
    };
  }
}
