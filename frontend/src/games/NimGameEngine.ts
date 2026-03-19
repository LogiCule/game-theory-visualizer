import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';
import type { BaseGameState, Player } from './core/TwoPlayerGameEngine';

export type NimMove = 1 | 2 | 3;

export interface NimState extends BaseGameState<NimMove> {
  stones: number;
}

export class NimGameEngine extends TwoPlayerGameEngine<NimState, NimMove, string> {
  public getInitialState(input: string): NimState {
    let stones = parseInt(input.trim());
    if (isNaN(stones) || stones <= 0) stones = 10;
    
    return {
      stones,
      currentPlayer: 'Alice',
      scores: { Alice: 0, Bob: 0 },
      gameOver: false,
      history: []
    };
  }

  public isTerminal(state: NimState): boolean {
    return state.stones === 0;
  }

  public getValidMoves(state: NimState): NimMove[] {
    if (this.isTerminal(state)) return [];
    const moves: NimMove[] = [];
    if (state.stones >= 1) moves.push(1);
    if (state.stones >= 2) moves.push(2);
    if (state.stones >= 3) moves.push(3);
    return moves;
  }

  public getResult(state: NimState): Player | "Tie" | null {
    if (!this.isTerminal(state)) return null;
    // The player who takes the last stone wins.
    // Since the player identity switches AFTER a move, the winner is the previous player.
    return this.switchPlayer(state.currentPlayer);
  }

  public isValidMove(state: NimState, move: NimMove): boolean {
    if (this.isTerminal(state)) return false;
    return [1, 2, 3].includes(move) && move <= state.stones;
  }

  public applyMove(state: NimState, move: NimMove): NimState {
    if (!this.isValidMove(state, move)) throw new Error("Invalid move");

    const newStones = state.stones - move;
    
    // Using string interpolation for the generic history description
    const newHistory = [...state.history, this.createHistoryEntry(state.currentPlayer, move, `removed ${move} stone(s)`)];

    return {
      stones: newStones,
      currentPlayer: this.switchPlayer(state.currentPlayer),
      scores: state.scores, // Unused in Nim, but preserved for standard engine compatibility
      gameOver: newStones === 0,
      history: newHistory
    };
  }

  public getOptimalMove(state: NimState): NimMove | null {
    if (this.isTerminal(state)) return null;
    const rem = state.stones % 4;
    // If rem is 0, we are in a losing position and any move leads to a winning position for the opponent.
    // We just take 1 to prolong the game. Otherwise we take the remainder to force a multiple of 4.
    if (rem === 0) return 1;
    return rem as NimMove;
  }
}
