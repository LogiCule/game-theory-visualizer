export type Player = 'Alice' | 'Bob';
import type { MoveExplanation } from './GameExplainer';
export type HistoryEntry<TMove> = {
  player: Player;
  move: TMove;
  description: string;
  explanation?: MoveExplanation;
};

export interface BaseGameState<TMove> {
  currentPlayer: Player;
  scores: { Alice: number; Bob: number };
  gameOver: boolean;
  history: HistoryEntry<TMove>[];
}

export abstract class TwoPlayerGameEngine<TState extends BaseGameState<TMove>, TMove, TConfig = unknown> {
  public abstract getInitialState(configuration: TConfig): TState;
  
  public abstract isValidMove(state: TState, move: TMove): boolean;
  
  public abstract applyMove(state: TState, move: TMove): TState;

  public abstract getValidMoves(state: TState): TMove[];

  public abstract isTerminal(state: TState): boolean;

  public abstract getResult(state: TState): Player | "Tie" | null;
  
  public abstract getOptimalMove?(state: TState): TMove | null;

  public evaluate?(state: TState): number;

  public makeMove(state: TState, move: TMove): TState {
    if (state.gameOver || this.isTerminal(state)) {
      throw new Error("Cannot make move: Game is already over.");
    }
    if (!this.isValidMove(state, move)) {
      throw new Error("Cannot make move: Invalid move.");
    }
    return this.applyMove(state, move);
  }

  protected switchPlayer(currentPlayer: Player): Player {
    return currentPlayer === 'Alice' ? 'Bob' : 'Alice';
  }

  protected createHistoryEntry(player: Player, move: TMove, description: string): HistoryEntry<TMove> {
    return { player, move, description };
  }
}
