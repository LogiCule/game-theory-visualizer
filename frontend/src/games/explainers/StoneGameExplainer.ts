import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';
import {
  classifyByDiff, difficultyNote,
  verdictLabel,
} from '../core/GameExplainer';
import type { AIDifficulty } from '../../ai/AIStrategy';

/**
 * Shared explainer for Stone Game I, II, and III.
 *
 * Stone Game I   — move is 'left' | 'right'
 * Stone Game II  — move is a number (1..2M)
 * Stone Game III — move is a number (1..3)
 */
export class StoneGameExplainer implements GameExplainer<any, any> {
  explain(
    state: any,
    move: any,
    analysis?: GameAnalysis<any>,
    difficulty?: AIDifficulty,
  ): MoveExplanation {
    // ── 1. Resolve picked value ───────────────────────────────────────────────
    let pickedValue: number;
    if (typeof move === 'string') {
      pickedValue = move === 'left' ? state.piles[0] : state.piles[state.piles.length - 1];
    } else {
      pickedValue = move as number;
    }

    // ── 2. Optimal move comparison ────────────────────────────────────────────
    const isOptimal = analysis?.optimalMove !== undefined
      ? analysis.optimalMove === move
      : false;

    const isWinning = analysis?.winner === state.currentPlayer;

    let diff = 0;
    if (analysis?.optimalMove !== undefined && !isOptimal) {
      diff = isWinning ? -1 : -4;
    }

    // ── 3. Verdict & confidence ───────────────────────────────────────────────
    const verdict = classifyByDiff(diff, false);
    const confidence: 'high' | 'medium' | 'low' = analysis
      ? (isOptimal ? 'high' : diff < -3 ? 'high' : 'medium')
      : 'low';

    // ── 4. Build ordered reasons ──────────────────────────────────────────────
    const reasons: string[] = [];
    const tags: string[] = [];

    if (isOptimal) {
      reasons.push('Maximizes score difference — best available pick');
      tags.push('optimal');
      if (isWinning) { reasons.push('Projected to win with consistent play'); tags.push('winning position'); }
      else { reasons.push("Minimizes opponent's future score potential"); }
    } else {
      if (isWinning) {
        const optStr = analysis?.optimalMove !== undefined
          ? ` (optimal: take ${typeof analysis.optimalMove === 'string' ? analysis.optimalMove : analysis.optimalMove + ' stones'})`
          : '';
        reasons.push(`Allows opponent a stronger pick next turn${optStr}`);
      } else {
        reasons.push('Hands opponent an advantageous position — score gap widens');
      }
      tags.push('suboptimal');

      if (analysis?.optimalMove !== undefined) {
        const optLabel = typeof analysis.optimalMove === 'string'
          ? analysis.optimalMove + ' pile'
          : analysis.optimalMove + ' stones';
        reasons.push(`Optimal was: take ${optLabel} to maintain control`);
      }
    }

    if (reasons.length < 3) {
      const totalLeft = state.piles
        ? state.piles.reduce((a: number, b: number) => a + b, 0)
        : (state.stones ?? 0);
      const pct = Math.round((pickedValue / Math.max(1, totalLeft + pickedValue)) * 100);
      reasons.push(`Pick accounts for ~${pct}% of remaining pile value`);
    }

    const dNote = difficulty ? difficultyNote(difficulty, verdict) : null;
    if (dNote && reasons.length < 3) reasons.push(dNote);

    // ── 5. Summary ────────────────────────────────────────────────────────────
    const scoreStr = ` (+${pickedValue})`;
    const confStr = ` • ${confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence`;
    const summary = `${verdictLabel[verdict]}${scoreStr}${confStr}`;

    return { summary, verdict, confidence, reasons, scoreImpact: pickedValue, tags };
  }
}
