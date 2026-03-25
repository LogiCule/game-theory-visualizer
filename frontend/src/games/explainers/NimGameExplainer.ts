import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';
import type { NimState, NimMove } from '../NimGameEngine';
import {
  classifyByDiff, computeConfidence, difficultyNote,
  verdictLabel,
} from '../core/GameExplainer';
import type { AIDifficulty } from '../../ai/AIStrategy';

export class NimGameExplainer implements GameExplainer<NimState, NimMove> {
  explain(
    state: NimState,
    move: NimMove,
    analysis?: GameAnalysis<NimMove>,
    difficulty?: AIDifficulty,
  ): MoveExplanation {
    const remaining = state.stones - move;
    const totalStones = state.stones;

    // ── 1. Nim theory ────────────────────────────────────────────────────────
    const leavesLosingState = remaining % 4 === 0;
    const wasInLosingPosition = totalStones % 4 === 0;

    const isOptimalMove = analysis
      ? analysis.optimalMove === move
      : leavesLosingState;

    const optimalMove: NimMove | undefined = analysis?.optimalMove as NimMove | undefined;

    // ── 2. Score diff ─────────────────────────────────────────────────────────
    let diff = 0;
    if (!isOptimalMove && !wasInLosingPosition) diff = -5;
    else if (!isOptimalMove && wasInLosingPosition) diff = -1;

    // ── 3. Verdict & confidence ───────────────────────────────────────────────
    const verdict = classifyByDiff(diff, false);
    const confidence = analysis ? 'high' : computeConfidence(Math.abs(diff));

    // ── 4. Build ordered reasons ──────────────────────────────────────────────
    const reasons: string[] = [];
    const tags: string[] = [];

    if (remaining === 0) {
      reasons.push('Takes the last stone — opponent loses immediately');
      tags.push('win');
    } else if (leavesLosingState && !wasInLosingPosition) {
      reasons.push(`Leaves ${remaining} stones — a multiple of 4, forcing opponent into losing position`);
      tags.push('forcing move');
    } else if (wasInLosingPosition && !isOptimalMove) {
      reasons.push(`Already in a losing position (${totalStones} is a multiple of 4) — any move loses with optimal opponent play`);
      tags.push('losing position');
    } else if (!leavesLosingState && !wasInLosingPosition) {
      const winMove = optimalMove ?? ((totalStones % 4) as NimMove);
      reasons.push(`Should have taken ${winMove} to leave ${totalStones - winMove} (a multiple of 4) — misses forced win`);
      tags.push('blunder');
    } else if (leavesLosingState) {
      reasons.push('Maintains control — leaves opponent in losing state');
      tags.push('optimal');
    }

    if (reasons.length < 2) {
      if (move === 3) reasons.push('Maximum removal — maximizes pressure on opponent');
      else if (move === 1) reasons.push('Conservative removal — minimal stone reduction');
      else reasons.push(`Takes ${move} stone(s) — moderate tempo`);
    }

    const dNote = difficulty ? difficultyNote(difficulty, verdict) : null;
    if (dNote && reasons.length < 3) reasons.push(dNote);

    // ── 5. Summary ────────────────────────────────────────────────────────────
    const scoreStr = diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : '';
    const confStr = ` • ${confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence`;
    const summary = `${verdictLabel[verdict]}${scoreStr}${confStr}`;

    return { summary, verdict, confidence, reasons, tags };
  }
}
