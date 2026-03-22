import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';

export class StoneGameExplainer implements GameExplainer<any, any> {
  explain(state: any, move: any, analysis?: GameAnalysis<any>): MoveExplanation {
    const reasons: string[] = [];
    
    let pickedValue: number;
    if (typeof move === 'string') {
        pickedValue = move === 'left' ? state.piles[0] : state.piles[state.piles.length - 1];
    } else {
        pickedValue = move as number;
    }
    
    let impact: "strong" | "neutral" | "weak" = "neutral";
    let summary = `Took ${pickedValue} stone(s)`;

    if (analysis && analysis.optimalMove !== undefined) {
      // In Game 2 and 3, move might equal optimalMove directly if taking number
      if (analysis.optimalMove === move) {
        impact = "strong";
        summary = `⭐ ` + summary;
        reasons.push(`Maximizes score difference`);
        if (analysis.winner === state.currentPlayer) {
           reasons.push(`Leads to winning position`);
        }
      } else {
        impact = "weak";
        summary = `⚠️ ` + summary;
        reasons.push(`Allows opponent advantage`);
      }
    } else {
      // Approximation fallback
      let maxAvailable = state.piles[0];
      if (typeof move === 'string') {
         maxAvailable = Math.max(state.piles[0], state.piles[state.piles.length - 1]);
      }
      
      if (pickedValue >= maxAvailable && typeof move === 'string') {
         impact = "strong";
         summary = `⭐ ` + summary;
         reasons.push(`Maximizes score difference`);
      } else if (typeof move === 'string') {
         impact = "weak";
         summary = `⚠️ ` + summary;
         reasons.push(`Allows opponent advantage`);
      } else {
         impact = "neutral";
         reasons.push(`Increases score by ${pickedValue}`);
      }
    }

    return {
      summary,
      impact,
      reasons,
      scoreImpact: pickedValue,
    };
  }
}
