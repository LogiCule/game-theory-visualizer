import type { Player } from './TwoPlayerGameEngine';

export interface GameAnalysis<TMove> {
  winner: Player | "Tie";
  optimalMove?: TMove;
  scoreDiff?: number;
}

export interface GameAnalyzer<TState, TMove> {
  analyze(state: TState): GameAnalysis<TMove>;
}

export type GameTreeNode<TState, TMove> = {
  state: TState;
  move?: TMove;
  children?: GameTreeNode<TState, TMove>[];
};
