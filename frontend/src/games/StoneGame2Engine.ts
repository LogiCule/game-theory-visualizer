import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';
import type { BaseGameState, Player } from './core/TwoPlayerGameEngine';

export type StoneGame2Move = number; // X stones taken

export interface StoneGame2State extends BaseGameState<StoneGame2Move> {
  piles: number[];
  M: number;
}

export class StoneGame2Engine extends TwoPlayerGameEngine<StoneGame2State, StoneGame2Move, string> {
  public getInitialState(input: string): StoneGame2State {
    let piles: number[] = [];
    if (input.trim()) {
      piles = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }
    if (piles.length === 0) piles = [2, 7, 9, 4, 4];
    
    return {
      piles,
      M: 1,
      currentPlayer: 'Alice',
      scores: { Alice: 0, Bob: 0 },
      gameOver: false,
      history: []
    };
  }

  public isTerminal(state: StoneGame2State): boolean {
    return state.piles.length === 0 || state.gameOver;
  }

  public getValidMoves(state: StoneGame2State): StoneGame2Move[] {
    if (this.isTerminal(state)) return [];
    const maxTake = Math.min(2 * state.M, state.piles.length);
    return Array.from({ length: maxTake }, (_, i) => i + 1);
  }

  public getResult(state: StoneGame2State): Player | "Tie" | null {
    if (!this.isTerminal(state) && !state.gameOver) return null;
    if (state.scores.Alice > state.scores.Bob) return "Alice";
    if (state.scores.Bob > state.scores.Alice) return "Bob";
    return "Tie";
  }

  public isValidMove(state: StoneGame2State, move: StoneGame2Move): boolean {
    if (this.isTerminal(state)) return false;
    const maxTake = 2 * state.M;
    return move >= 1 && move <= maxTake && move <= state.piles.length;
  }

  public applyMove(state: StoneGame2State, move: StoneGame2Move): StoneGame2State {
    if (!this.isValidMove(state, move)) return state;

    const newPiles = [...state.piles];
    let pickedValue = 0;

    for (let i = 0; i < move; i++) {
        pickedValue += newPiles.shift()!;
    }

    const newScores = { ...state.scores };
    newScores[state.currentPlayer] += pickedValue;

    const newHistory = [...state.history, this.createHistoryEntry(state.currentPlayer, move, `took ${move} pile(s) for ${pickedValue} pts`)];

    return {
      piles: newPiles,
      M: Math.max(state.M, move),
      currentPlayer: this.switchPlayer(state.currentPlayer),
      scores: newScores,
      gameOver: newPiles.length === 0,
      history: newHistory
    };
  }

  public getOptimalMove(state: StoneGame2State): StoneGame2Move | null {
    const piles = state.piles;
    const M = state.M;
    const n = piles.length;
    if (n === 0) return null;

    // dp(i, m) = max stones a player can get from piles[i:] with M = m
    const suffixSum = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        suffixSum[i] = suffixSum[i + 1] + piles[i];
    }

    const memo = new Map<string, number>();

    const dfs = (i: number, m: number): number => {
        if (i === n) return 0;
        if (i + 2 * m >= n) return suffixSum[i]; 

        const key = `${i},${m}`;
        if (memo.has(key)) return memo.get(key)!;

        let maxStones = 0;
        for (let x = 1; x <= 2 * m; x++) {
            maxStones = Math.max(maxStones, suffixSum[i] - dfs(i + x, Math.max(m, x)));
        }

        memo.set(key, maxStones);
        return maxStones;
    };

    let bestX = 1;
    let maxStones = -1;
    for (let x = 1; x <= Math.min(2 * M, n); x++) {
        const stones = suffixSum[0] - dfs(x, Math.max(M, x));
        if (stones > maxStones) {
            maxStones = stones;
            bestX = x;
        }
    }

    return bestX;
  }
}
