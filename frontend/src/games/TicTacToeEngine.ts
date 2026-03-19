import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';
import type { BaseGameState, Player } from './core/TwoPlayerGameEngine';

export type TicTacToeMove = {
  row: number;
  col: number;
};

export interface TicTacToeState extends BaseGameState<TicTacToeMove> {
  board: (Player | null)[][];
  winningLine?: { row: number; col: number }[];
}

export class TicTacToeEngine extends TwoPlayerGameEngine<TicTacToeState, TicTacToeMove, string> {
  
  public getInitialState(): TicTacToeState {
    const board = Array(3).fill(null).map(() => Array(3).fill(null));
    return {
      board,
      currentPlayer: 'Alice',
      scores: { Alice: 0, Bob: 0 },
      gameOver: false,
      history: []
    };
  }

  public getValidMoves(state: TicTacToeState): TicTacToeMove[] {
    if (this.isTerminal(state)) return [];
    const moves: TicTacToeMove[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (state.board[r][c] === null) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  public isValidMove(state: TicTacToeState, move: TicTacToeMove): boolean {
    if (this.isTerminal(state)) return false;
    if (move.row < 0 || move.row > 2 || move.col < 0 || move.col > 2) return false;
    return state.board[move.row][move.col] === null;
  }

  public applyMove(state: TicTacToeState, move: TicTacToeMove): TicTacToeState {
    if (!this.isValidMove(state, move)) throw new Error("Invalid move");

    const newBoard = state.board.map(row => [...row]);
    newBoard[move.row][move.col] = state.currentPlayer;

    const { winner, winningLine } = this.checkWin(newBoard);
    const isFull = newBoard.every(row => row.every(cell => cell !== null));
    const isOver = winner !== null || isFull;

    let newScores = { ...state.scores };
    if (winner === 'Alice') newScores.Alice++;
    else if (winner === 'Bob') newScores.Bob++;

    // Map 0,0 to "Top Left" intuitively
    const rowNames = ['Top', 'Center', 'Bottom'];
    const colNames = ['Left', 'Center', 'Right'];
    const cellName = rowNames[move.row] + ' ' + colNames[move.col];
    const notation = `Placed mark at ${cellName}`;
    
    const newHistory = [...state.history, this.createHistoryEntry(state.currentPlayer, move, notation)];

    return {
      board: newBoard,
      currentPlayer: this.switchPlayer(state.currentPlayer),
      scores: newScores,
      gameOver: isOver,
      history: newHistory,
      winningLine: winningLine || undefined
    };
  }

  public isTerminal(state: TicTacToeState): boolean {
    const { winner } = this.checkWin(state.board);
    if (winner !== null) return true;
    return state.board.every(row => row.every(cell => cell !== null));
  }

  public getResult(state: TicTacToeState): Player | "Tie" | null {
    if (!state.gameOver) return null;
    const { winner } = this.checkWin(state.board);
    if (winner) return winner;
    return "Tie";
  }

  public checkWin(board: (Player | null)[][]): { winner: Player | null, winningLine: {row: number, col: number}[] | null } {
    const lines = [
      // Rows
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
      [[2,0], [2,1], [2,2]],
      // Cols
      [[0,0], [1,0], [2,0]],
      [[0,1], [1,1], [2,1]],
      [[0,2], [1,2], [2,2]],
      // Diags
      [[0,0], [1,1], [2,2]],
      [[0,2], [1,1], [2,0]]
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (
        board[a[0]][a[1]] &&
        board[a[0]][a[1]] === board[b[0]][b[1]] &&
        board[a[0]][a[1]] === board[c[0]][c[1]]
      ) {
        return { winner: board[a[0]][a[1]], winningLine: line.map(p => ({ row: p[0], col: p[1] })) };
      }
    }
    return { winner: null, winningLine: null };
  }

  public getOptimalMove(state: TicTacToeState): TicTacToeMove | null {
    if (this.isTerminal(state)) return null;
    const validMoves = this.getValidMoves(state);
    
    // Hardcoded center rule for empty board performance
    if (validMoves.length === 9) return { row: 1, col: 1 };
    
    let bestScore = -Infinity;
    let bestMove = validMoves[0];
    const maximizingPlayer = state.currentPlayer;

    for (const move of validMoves) {
      const evalScore = this.minimax(this.applyMove(state, move), maximizingPlayer, 0);
      if (evalScore > bestScore) {
        bestScore = evalScore;
        bestMove = move;
      }
    }
    return bestMove;
  }

  public minimax(state: TicTacToeState, maximizingPlayer: Player, depth: number): number {
    const result = this.getResult(state);
    if (result !== null) {
      if (result === 'Tie') return 0;
      return result === maximizingPlayer ? 10 - depth : depth - 10;
    }

    if (state.currentPlayer === maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of this.getValidMoves(state)) {
        const evalScore = this.minimax(this.applyMove(state, move), maximizingPlayer, depth + 1);
        maxEval = Math.max(maxEval, evalScore);
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of this.getValidMoves(state)) {
        const evalScore = this.minimax(this.applyMove(state, move), maximizingPlayer, depth + 1);
        minEval = Math.min(minEval, evalScore);
      }
      return minEval;
    }
  }
}
