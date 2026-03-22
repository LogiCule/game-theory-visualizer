import type { BaseGameState } from './core/TwoPlayerGameEngine';
import type { GameAnalysis } from './core/GameAnalyzer';
import { getExplainerForGame } from './explainerRegistry';

export function applyMoveWithExplanation<TState extends BaseGameState<TMove>, TMove>(
  engine: any,
  state: TState,
  move: TMove,
  gameId: string,
  analysis?: GameAnalysis<TMove>
): TState {
  const newState = engine.applyMove(state, move);
  const explainer = getExplainerForGame(gameId);
  if (explainer) {
    const explanation = explainer.explain(state, move, analysis);
    if (explanation && newState.history.length > 0) {
      newState.history[newState.history.length - 1].explanation = explanation;
    }
  }
  return newState;
}
