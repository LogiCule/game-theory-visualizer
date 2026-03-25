/**
 * AI Difficulty System - Strategy Layer
 *
 * Provides a clean strategy pattern for difficulty-based AI play.
 * Each difficulty maps to a specific depth and randomness factor.
 *
 * Architecture:
 *  - AIStrategy: interface contracts selectMove()
 *  - EasyStrategy:   shallow depth + high randomness (plays random most of the time)
 *  - MediumStrategy: moderate depth + occasional random move
 *  - HardStrategy:   full depth, always optimal
 *
 * All strategies work generically with any TwoPlayerGameEngine.
 */

import type { TwoPlayerGameEngine, BaseGameState } from '../games/core/TwoPlayerGameEngine';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIStrategyConfig {
  /** Minimax search depth passed to engine.getOptimalMove (if it accepts one). */
  depth: number;
  /**
   * Probability [0,1] of choosing a random valid move instead of optimal.
   * 0 = always optimal, 1 = always random.
   */
  randomnessFactor: number;
}

export const DIFFICULTY_CONFIGS: Record<AIDifficulty, AIStrategyConfig> = {
  easy:   { depth: 1, randomnessFactor: 0.85 },
  medium: { depth: 3, randomnessFactor: 0.35 },
  hard:   { depth: 7, randomnessFactor: 0.0  },
};

// ─── Interface ───────────────────────────────────────────────────────────────

export interface AIStrategy {
  difficulty: AIDifficulty;
  config: AIStrategyConfig;
  /**
   * Select a move for the given game state.
   * @param engine  - The game engine (provides getValidMoves + getOptimalMove).
   * @param state   - Current game state.
   * @param depth   - Optional override depth (e.g. for iterative deepening in worker).
   * @returns Selected move or null if terminal.
   */
  selectMove<TState extends BaseGameState<TMove>, TMove>(
    engine: TwoPlayerGameEngine<TState, TMove, any>,
    state: TState,
    depth?: number,
  ): TMove | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Strategy Implementations ────────────────────────────────────────────────

export class EasyStrategy implements AIStrategy {
  difficulty: AIDifficulty = 'easy';
  config = DIFFICULTY_CONFIGS.easy;

  selectMove<TState extends BaseGameState<TMove>, TMove>(
    engine: TwoPlayerGameEngine<TState, TMove, any>,
    state: TState,
    depth?: number,
  ): TMove | null {
    const validMoves = engine.getValidMoves(state);
    if (!validMoves.length) return null;

    // High randomness: usually pick a random move, occasionally play greedy
    if (Math.random() < this.config.randomnessFactor) {
      return pickRandom(validMoves);
    }

    // Fallback to a shallow optimal search ( depth = 1 by default)
    const resolvedDepth = depth ?? this.config.depth;
    if (engine.getOptimalMove) {
      return engine.getOptimalMove(state, resolvedDepth);
    }
    return pickRandom(validMoves);
  }
}

export class MediumStrategy implements AIStrategy {
  difficulty: AIDifficulty = 'medium';
  config = DIFFICULTY_CONFIGS.medium;

  selectMove<TState extends BaseGameState<TMove>, TMove>(
    engine: TwoPlayerGameEngine<TState, TMove, any>,
    state: TState,
    depth?: number,
  ): TMove | null {
    const validMoves = engine.getValidMoves(state);
    if (!validMoves.length) return null;

    // Moderate chance of random move
    if (Math.random() < this.config.randomnessFactor) {
      return pickRandom(validMoves);
    }

    const resolvedDepth = depth ?? this.config.depth;
    if (engine.getOptimalMove) {
      return engine.getOptimalMove(state, resolvedDepth);
    }
    return pickRandom(validMoves);
  }
}

export class HardStrategy implements AIStrategy {
  difficulty: AIDifficulty = 'hard';
  config = DIFFICULTY_CONFIGS.hard;

  selectMove<TState extends BaseGameState<TMove>, TMove>(
    engine: TwoPlayerGameEngine<TState, TMove, any>,
    state: TState,
    depth?: number,
  ): TMove | null {
    const validMoves = engine.getValidMoves(state);
    if (!validMoves.length) return null;

    const resolvedDepth = depth ?? this.config.depth;
    if (engine.getOptimalMove) {
      return engine.getOptimalMove(state, resolvedDepth);
    }
    // Pure game theory fallback: shouldn't happen for supported engines
    return pickRandom(validMoves);
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createStrategy(difficulty: AIDifficulty): AIStrategy {
  switch (difficulty) {
    case 'easy':   return new EasyStrategy();
    case 'medium': return new MediumStrategy();
    case 'hard':   return new HardStrategy();
  }
}

export function getDifficultyLabel(difficulty: AIDifficulty): string {
  switch (difficulty) {
    case 'easy':   return 'Easy';
    case 'medium': return 'Medium';
    case 'hard':   return 'Hard';
  }
}
