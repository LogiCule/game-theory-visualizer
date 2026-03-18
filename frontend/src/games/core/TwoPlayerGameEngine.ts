export type Player = 'Alice' | 'Bob';

export interface BaseGameState {
  currentPlayer: Player;
  scores: { Alice: number; Bob: number };
  gameOver: boolean;
  history: string[];
}

export abstract class TwoPlayerGameEngine<TState extends BaseGameState, TMove> {
  public abstract getInitialState(configuration: unknown): TState;
  
  public abstract isValidMove(state: TState, move: TMove): boolean;
  
  public abstract applyMove(state: TState, move: TMove): TState;
  
  public abstract getOptimalMove?(state: TState): TMove | null;

  public getWinner(state: TState): string | null {
    if (!state.gameOver) return null;
    if (state.scores.Alice > state.scores.Bob) return "Alice";
    if (state.scores.Bob > state.scores.Alice) return "Bob";
    return "Tie";
  }

  protected switchPlayer(currentPlayer: Player): Player {
    return currentPlayer === 'Alice' ? 'Bob' : 'Alice';
  }

  protected createHistoryEntry(player: Player, action: string): string {
    return `${player} ${action}`;
  }
}
