import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';
import type { BaseGameState, Player } from './core/TwoPlayerGameEngine';

export type StoneGameMove = 'left' | 'right';

export interface StoneGameState extends BaseGameState<StoneGameMove> {
  piles: number[];
}

export class StoneGameEngine extends TwoPlayerGameEngine<StoneGameState, StoneGameMove, string> {
  
  public getInitialState(input: string): StoneGameState {
    let piles: number[] = [];
    if (input.trim()) {
      piles = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }
    if (piles.length === 0) piles = [5, 3, 4, 5];
    
    return {
      piles,
      currentPlayer: 'Alice',
      scores: { Alice: 0, Bob: 0 },
      gameOver: false,
      history: []
    };
  }

  public isTerminal(state: StoneGameState): boolean {
    return state.piles.length === 0;
}

  public getValidMoves(state: StoneGameState): StoneGameMove[] {
  if (this.isTerminal(state)) return [];
  if (state.piles.length === 1) return ['left'];
  return ['left', 'right'];
}

  public getResult(state: StoneGameState): Player | "Tie" | null {
    if (!this.isTerminal(state) && !state.gameOver) return null;
    if (state.scores.Alice > state.scores.Bob) return "Alice";
    if (state.scores.Bob > state.scores.Alice) return "Bob";
    return "Tie";
  }

  public isValidMove(state: StoneGameState, move: StoneGameMove): boolean {
  if (this.isTerminal(state)) return false;
  return move === 'left' || move === 'right';
}

  public applyMove(state: StoneGameState, move: StoneGameMove): StoneGameState {
    if (!this.isValidMove(state, move)) throw new Error("Invalid move");

    const newPiles = [...state.piles];
    let pickedValue = 0;

    if (move === 'left') {
      pickedValue = newPiles.shift()!;
    } else {
      pickedValue = newPiles.pop()!;
    }

    const newScores = { ...state.scores };
    newScores[state.currentPlayer] += pickedValue;

    const newHistory = [...state.history, this.createHistoryEntry(state.currentPlayer, move, `picked ${move.toUpperCase()} (${pickedValue})`)];

    return {
      piles: newPiles,
      currentPlayer: this.switchPlayer(state.currentPlayer),
      scores: newScores,
      gameOver: newPiles.length === 0,
      history: newHistory
    };
  }

  public getOptimalMove(state: StoneGameState): StoneGameMove | null {
    const piles = state.piles;
    const n = piles.length;
    if (n === 0) return null;
    if (n === 1) return 'left';
    if (n === 2) return piles[0] >= piles[1] ? 'left' : 'right';

    const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      dp[i][i] = piles[i];
    }

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        let j = i + len - 1;
        dp[i][j] = Math.max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1]);
      }
    }

    const pickLeftDiff = piles[0] - dp[1][n - 1];
    const pickRightDiff = piles[n - 1] - dp[0][n - 2];

    return pickLeftDiff >= pickRightDiff ? 'left' : 'right';
  }
}
