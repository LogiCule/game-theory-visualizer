import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';
import type { NimState, NimMove } from '../NimGameEngine';

export class NimGameExplainer implements GameExplainer<NimState, NimMove> {
  explain(state: NimState, move: NimMove, analysis?: GameAnalysis<NimMove>): MoveExplanation {
    const reasons: string[] = [];
    const remainingStones = state.stones - move;
    
    let impact: "strong" | "neutral" | "weak" = "neutral";
    let summary = `Removed ${move} stone(s)`;

    const isMultipleOf4 = remainingStones % 4 === 0;

    if (analysis && analysis.optimalMove) {
      if (analysis.optimalMove === move) {
        impact = "strong";
        summary = `⭐ ` + summary;
        reasons.push(`Leaves opponent in losing position`);
      } else {
        impact = "weak";
        summary = `⚠️ ` + summary;
        reasons.push(`Fails to create losing state`);
      }
    } else {
      if (isMultipleOf4) {
        impact = "strong";
        summary = `⭐ ` + summary;
        reasons.push(`Leaves opponent in losing position`);
      } else {
        impact = "weak";
        summary = `⚠️ ` + summary;
        reasons.push(`Fails to create losing state`);
      }
    }

    return {
      summary,
      impact,
      reasons,
    };
  }
}
