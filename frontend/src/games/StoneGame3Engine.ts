import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';
import type { BaseGameState, Player } from './core/TwoPlayerGameEngine';

export type StoneGame3Move = number; // 1, 2, or 3 stones taken

export interface StoneGame3State extends BaseGameState<StoneGame3Move> {
  piles: number[]; // Represents stoneValue
}

export class StoneGame3Engine extends TwoPlayerGameEngine<StoneGame3State, StoneGame3Move, string> {
  public getInitialState(input: string): StoneGame3State {
    let piles: number[] = [];
    if (input.trim()) {
      piles = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }
    if (piles.length === 0) piles = [1, 2, 3, 7];
    
    return {
      piles,
      currentPlayer: 'Alice',
      scores: { Alice: 0, Bob: 0 },
      gameOver: false,
      history: []
    };
  }

  public isTerminal(state: StoneGame3State): boolean {
    return state.piles.length === 0 || state.gameOver;
  }

  public getValidMoves(state: StoneGame3State): StoneGame3Move[] {
    if (this.isTerminal(state)) return [];
    const maxTake = Math.min(3, state.piles.length);
    return Array.from({ length: maxTake }, (_, i) => i + 1);
  }

  public getResult(state: StoneGame3State): Player | "Tie" | null {
    if (!this.isTerminal(state) && !state.gameOver) return null;
    if (state.scores.Alice > state.scores.Bob) return "Alice";
    if (state.scores.Bob > state.scores.Alice) return "Bob";
    return "Tie";
  }

  public isValidMove(state: StoneGame3State, move: StoneGame3Move): boolean {
    if (this.isTerminal(state)) return false;
    return move >= 1 && move <= 3 && move <= state.piles.length;
  }

  public applyMove(state: StoneGame3State, move: StoneGame3Move): StoneGame3State {
    if (!this.isValidMove(state, move)) return state;

    const newPiles = [...state.piles];
    let pickedValue = 0;

    for (let i = 0; i < move; i++) {
        pickedValue += newPiles.shift()!;
    }

    const newScores = { ...state.scores };
    newScores[state.currentPlayer] += pickedValue;

    const newHistory = [...state.history, this.createHistoryEntry(state.currentPlayer, move, `took ${move} stone(s) for ${pickedValue} pts`)];

    return {
      piles: newPiles,
      currentPlayer: this.switchPlayer(state.currentPlayer),
      scores: newScores,
      gameOver: newPiles.length === 0,
      history: newHistory
    };
  }

  public getOptimalMove(state: StoneGame3State): StoneGame3Move | null {
    const piles = state.piles;
    const n = piles.length;
    if (n === 0) return null;

    // dp[i] is the maximum score DIFFERENCE a player can achieve from piles[i:]
    const dp = new Array(n + 1).fill(-Infinity);
    dp[n] = 0; 

    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let x = 1; x <= 3 && i + x <= n; x++) {
            sum += piles[i + x - 1];
            dp[i] = Math.max(dp[i], sum - dp[i + x]);
        }
    }

    let bestX = 1;
    let maxDiff = -Infinity;
    let sum = 0;
    for (let x = 1; x <= 3 && x <= n; x++) {
        sum += piles[x - 1];
        const diff = sum - dp[x];
        if (diff > maxDiff) {
            maxDiff = diff;
            bestX = x;
        }
    }

    return bestX;
  }
}
