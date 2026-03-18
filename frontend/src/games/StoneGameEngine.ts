import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';
import type { BaseGameState } from './core/TwoPlayerGameEngine';

export interface StoneGameState extends BaseGameState {
  piles: number[];
}

export type StoneGameMove = 'left' | 'right';

export class StoneGameEngine extends TwoPlayerGameEngine<StoneGameState, StoneGameMove> {
  
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

  public isValidMove(state: StoneGameState, _move: StoneGameMove): boolean {
    if (state.gameOver || state.piles.length === 0) return false;
    return true; 
  }

  public applyMove(state: StoneGameState, move: StoneGameMove): StoneGameState {
    if (!this.isValidMove(state, move)) return state;

    const newPiles = [...state.piles];
    let pickedValue = 0;

    if (move === 'left') {
      pickedValue = newPiles.shift()!;
    } else {
      pickedValue = newPiles.pop()!;
    }

    const newScores = { ...state.scores };
    newScores[state.currentPlayer] += pickedValue;

    const newHistory = [...state.history, this.createHistoryEntry(state.currentPlayer, `picked ${move.toUpperCase()} (${pickedValue})`)];

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
