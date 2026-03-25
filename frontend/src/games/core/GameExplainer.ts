import type { GameAnalysis } from './GameAnalyzer';
import type { AIDifficulty } from '../../ai/AIStrategy';

/**
 * Verdict tier for a move — drives color-coding and label in the UI.
 *
 * ⭐ Optimal    → green    diff === 0 vs best, or is a known forcing move
 * ✓ Decent     → yellow   diff small (≥ -1)
 * ⚠️ Suboptimal → orange   diff moderate (≥ -3)
 * ❌ Blunder    → red      diff large (< -3) or allows immediate loss
 */
export type MoveVerdict = 'optimal' | 'decent' | 'suboptimal' | 'blunder';

export type MoveConfidence = 'high' | 'medium' | 'low';

export type MoveExplanation = {
  /** Short headline displayed in the match log. e.g. "⭐ Optimal Move (+4)" */
  summary: string;
  /** Four-tier evaluation */
  verdict: MoveVerdict;
  /** Confidence level of the evaluation */
  confidence: MoveConfidence;
  /** Ordered reasons — most impactful first, max 3 */
  reasons: string[];
  /** Optional numeric score impact shown as "+3" or "-2" */
  scoreImpact?: number;
  /** Optional semantic tags, e.g. ["center control", "blocking"] */
  tags?: string[];
};

export interface GameExplainer<TState, TMove> {
  explain(
    state: TState,
    move: TMove,
    analysis?: GameAnalysis<TMove>,
    difficulty?: AIDifficulty,
  ): MoveExplanation;
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

/** Emoji + label string for a verdict */
export const verdictLabel: Record<MoveVerdict, string> = {
  optimal:    'Optimal Move',
  decent:     'Decent Move',
  suboptimal: 'Suboptimal Move',
  blunder:    'Blunder',
};

/** Color classes for verdict — used by MoveHistory */
export const verdictColor: Record<MoveVerdict, string> = {
  optimal:    'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  decent:     'text-amber-300 border-amber-400/40 bg-amber-400/10',
  suboptimal: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  blunder:    'text-rose-400 border-rose-500/40 bg-rose-500/10',
};

/**
 * Classify a move based on score difference from optimal.
 * diff = moveScore - bestScore  (negative = worse)
 */
export function classifyByDiff(diff: number, allowsImmediateLoss: boolean): MoveVerdict {
  if (allowsImmediateLoss) return 'blunder';
  if (diff < -3) return 'blunder';
  if (diff < -1) return 'suboptimal';
  if (diff < 0)  return 'decent';
  return 'optimal';
}

/** Compute confidence from absolute score spread */
export function computeConfidence(absScore: number): MoveConfidence {
  if (absScore > 4) return 'high';
  if (absScore > 1) return 'medium';
  return 'low';
}

/** Difficulty-aware note appended to reasons */
export function difficultyNote(difficulty: AIDifficulty | undefined, verdict: MoveVerdict): string | null {
  if (!difficulty) return null;
  switch (difficulty) {
    case 'easy':
      return verdict === 'optimal'
        ? 'Random move (Easy AI occasionally plays well)'
        : 'Random move — Easy AI does not follow optimal strategy';
    case 'medium':
      return verdict === 'optimal'
        ? 'Near-optimal move (Medium AI, moderate depth)'
        : 'Misses deeper winning sequence (Medium AI)';
    case 'hard':
      return verdict === 'optimal'
        ? 'Optimal move from full-depth minimax search'
        : null; // Hard AI should rarely be non-optimal — no note needed
  }
}

