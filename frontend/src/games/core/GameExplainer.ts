import type { GameAnalysis } from './GameAnalyzer';

export type MoveExplanation = {
  summary: string;
  reasons: string[];
  impact: "strong" | "neutral" | "weak";
  scoreImpact?: number;
};

export interface GameExplainer<TState, TMove> {
  explain(
    state: TState,
    move: TMove,
    analysis?: GameAnalysis<TMove>
  ): MoveExplanation;
}
