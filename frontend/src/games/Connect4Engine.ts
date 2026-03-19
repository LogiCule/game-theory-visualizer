import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';
import type { BaseGameState, Player } from './core/TwoPlayerGameEngine';

export type Connect4Move = {
  col: number;
};

export interface Connect4State extends BaseGameState<Connect4Move> {
  board: (Player | null)[][]; // 6 rows (0 is top), 7 cols
  winningLine?: { row: number; col: number }[];
}

export class Connect4Engine extends TwoPlayerGameEngine<Connect4State, Connect4Move, string> {
  private readonly ROWS = 6;
  private readonly COLS = 7;
  
  public getInitialState(): Connect4State {
    const board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
    return {
      board,
      currentPlayer: 'Alice',
      scores: { Alice: 0, Bob: 0 },
      gameOver: false,
      history: []
    };
  }

  public getValidMoves(state: Connect4State): Connect4Move[] {
    if (this.isTerminal(state)) return [];
    const moves: Connect4Move[] = [];
    for (let c = 0; c < this.COLS; c++) {
      if (state.board[0][c] === null) {
        moves.push({ col: c });
      }
    }
    // Optimization: explore middle columns first
    const order = [3, 2, 4, 1, 5, 0, 6];
    return moves.sort((a, b) => order.indexOf(a.col) - order.indexOf(b.col));
  }

  public isValidMove(state: Connect4State, move: Connect4Move): boolean {
    if (this.isTerminal(state)) return false;
    if (move.col < 0 || move.col >= this.COLS) return false;
    return state.board[0][move.col] === null;
  }

  public applyMove(state: Connect4State, move: Connect4Move): Connect4State {
    if (!this.isValidMove(state, move)) throw new Error("Invalid move");

    const newBoard = state.board.map(row => [...row]);
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (newBoard[r][move.col] === null) {
        newBoard[r][move.col] = state.currentPlayer;
        break;
      }
    }

    const { winner, winningLine } = this.checkWin(newBoard);
    const isFull = newBoard[0].every(cell => cell !== null);
    const isOver = winner !== null || isFull;

    let newScores = { ...state.scores };
    if (winner === 'Alice') newScores.Alice++;
    else if (winner === 'Bob') newScores.Bob++;

    const notation = `Dropped in Col ${move.col + 1}`;
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

  public isTerminal(state: Connect4State): boolean {
    if (state.gameOver) return true;
    const { winner } = this.checkWin(state.board);
    if (winner !== null) return true;
    return state.board[0].every(cell => cell !== null);
  }

  public getResult(state: Connect4State): Player | "Tie" | null {
    if (!state.gameOver) return null;
    const { winner } = this.checkWin(state.board);
    if (winner) return winner;
    return "Tie";
  }

  public checkWin(board: (Player | null)[][]): { winner: Player | null, winningLine: {row: number, col: number}[] | null } {
    // Horizontal
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        if (board[r][c] && board[r][c] === board[r][c+1] && board[r][c] === board[r][c+2] && board[r][c] === board[r][c+3]) {
          return { winner: board[r][c], winningLine: [{row:r, col:c}, {row:r, col:c+1}, {row:r, col:c+2}, {row:r, col:c+3}] };
        }
      }
    }
    // Vertical
    for (let c = 0; c < this.COLS; c++) {
      for (let r = 0; r <= this.ROWS - 4; r++) {
        if (board[r][c] && board[r][c] === board[r+1][c] && board[r][c] === board[r+2][c] && board[r][c] === board[r+3][c]) {
          return { winner: board[r][c], winningLine: [{row:r, col:c}, {row:r+1, col:c}, {row:r+2, col:c}, {row:r+3, col:c}] };
        }
      }
    }
    // Diagonal Down-Right
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        if (board[r][c] && board[r][c] === board[r+1][c+1] && board[r][c] === board[r+2][c+2] && board[r][c] === board[r+3][c+3]) {
          return { winner: board[r][c], winningLine: [{row:r, col:c}, {row:r+1, col:c+1}, {row:r+2, col:c+2}, {row:r+3, col:c+3}] };
        }
      }
    }
    // Diagonal Up-Right
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        if (board[r][c] && board[r][c] === board[r-1][c+1] && board[r][c] === board[r-2][c+2] && board[r][c] === board[r-3][c+3]) {
          return { winner: board[r][c], winningLine: [{row:r, col:c}, {row:r-1, col:c+1}, {row:r-2, col:c+2}, {row:r-3, col:c+3}] };
        }
      }
    }
    return { winner: null, winningLine: null };
  }

  // --- MINIMAX AI ---
  private memo = new Map<string, number>();

  public clearMemo() {
    this.memo.clear();
  }

  public serialize(board: (Player | null)[][], currentPlayer: Player): string {
    return board.map(row => row.map(c => c === 'Alice' ? 'A' : c === 'Bob' ? 'B' : '.').join('')).join('') + currentPlayer;
  }

  public dropPiece(board: (Player | null)[][], col: number, player: Player): number {
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        board[r][col] = player;
        return r;
      }
    }
    return -1;
  }

  public removePiece(board: (Player | null)[][], row: number, col: number): void {
    board[row][col] = null;
  }

  public getOptimalMove(state: Connect4State, depthLimit = 5): Connect4Move | null {
    if (this.isTerminal(state)) return null;
    const validMoves = this.getValidMoves(state);
    if (validMoves.length === 0) return null;
    if (validMoves.length === 1) return validMoves[0];

    // If empty board, just take the center
    if (state.history.length === 0) return { col: 3 };

    this.clearMemo();
    let bestScore = -Infinity;
    let bestMove = validMoves[0];
    const maximizingPlayer = state.currentPlayer;
    const opponent = maximizingPlayer === 'Alice' ? 'Bob' : 'Alice';
    
    const board = state.board.map(row => [...row]);
    const order = [3, 2, 4, 1, 5, 0, 6];

    for (const col of order) {
      if (board[0][col] === null) {
        const row = this.dropPiece(board, col, maximizingPlayer);
        const evalScore = this.minimaxInternal(board, depthLimit - 1, -Infinity, Infinity, opponent, maximizingPlayer, depthLimit);
        this.removePiece(board, row, col);

        if (evalScore > bestScore) {
          bestScore = evalScore;
          bestMove = { col };
        }
      }
    }
    return bestMove;
  }

  public minimaxInternal(
    board: (Player | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    currentPlayer: Player,
    maximizingPlayer: Player,
    maxDepth: number
  ): number {
    const key = this.serialize(board, currentPlayer);
    if (this.memo.has(key)) return this.memo.get(key)!;

    const { winner } = this.checkWin(board);
    if (winner !== null) {
      return winner === maximizingPlayer ? 100000 - (maxDepth - depth) : -100000 + (maxDepth - depth);
    }
    
    let isFull = true;
    for (let c = 0; c < this.COLS; c++) {
      if (board[0][c] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) return 0; // Tie

    if (depth === 0) {
      return this.evaluateBoard(board, maximizingPlayer);
    }

    const isMaximizing = currentPlayer === maximizingPlayer;
    let bestVal = isMaximizing ? -Infinity : Infinity;
    const order = [3, 2, 4, 1, 5, 0, 6];
    const opponent = currentPlayer === 'Alice' ? 'Bob' : 'Alice';

    for (const col of order) {
      if (board[0][col] === null) {
        const row = this.dropPiece(board, col, currentPlayer);
        const score = this.minimaxInternal(board, depth - 1, alpha, beta, opponent, maximizingPlayer, maxDepth);
        this.removePiece(board, row, col);

        if (isMaximizing) {
          bestVal = Math.max(bestVal, score);
          alpha = Math.max(alpha, score);
        } else {
          bestVal = Math.min(bestVal, score);
          beta = Math.min(beta, score);
        }
        if (beta <= alpha) break;
      }
    }
    
    this.memo.set(key, bestVal);
    return bestVal;
  }

  private evaluateBoard(board: (Player | null)[][], player: Player): number {
    let score = 0;
    const opponent = player === 'Alice' ? 'Bob' : 'Alice';

    // Center column preference
    const centerArray = [];
    for (let r = 0; r < this.ROWS; r++) centerArray.push(board[r][3]);
    const centerCount = centerArray.filter(c => c === player).length;
    score += centerCount * 3;

    // Horizontal
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const window = [board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }
    // Vertical
    for (let c = 0; c < this.COLS; c++) {
      for (let r = 0; r <= this.ROWS - 4; r++) {
        const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }
    // Diag down-right
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }
    // Diag up-right
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const window = [board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]];
        score += this.evaluateWindow(window, player, opponent);
      }
    }

    return score;
  }

  private evaluateWindow(window: (Player | null)[], player: Player, opponent: Player): number {
    let score = 0;
    const playerCount = window.filter(c => c === player).length;
    const emptyCount = window.filter(c => c === null).length;
    const oppCount = window.filter(c => c === opponent).length;

    if (playerCount === 4) {
      score += 100;
    } else if (playerCount === 3 && emptyCount === 1) {
      score += 5;
    } else if (playerCount === 2 && emptyCount === 2) {
      score += 2;
    }

    if (oppCount === 3 && emptyCount === 1) {
      score -= 1000; // block opponent strongly
    } else if (oppCount === 2 && emptyCount === 2) {
      score -= 3;
    }

    return score;
  }
}
