import type { GameExplainer } from './core/GameExplainer';
import { StoneGameExplainer } from './explainers/StoneGameExplainer';
import { NimGameExplainer } from './explainers/NimGameExplainer';
import { TicTacToeExplainer } from './explainers/TicTacToeExplainer';
import { Connect4Explainer } from './explainers/Connect4Explainer';

const explainers: Record<string, GameExplainer<any, any>> = {
  'stone-game-1': new StoneGameExplainer(),
  'stone-game-2': new StoneGameExplainer() as any, 
  'stone-game-3': new StoneGameExplainer() as any,
  'nim-game': new NimGameExplainer(),
  'tic-tac-toe': new TicTacToeExplainer(),
  'connect-4': new Connect4Explainer()
};

export function getExplainerForGame(gameId: string): GameExplainer<any, any> | undefined {
  return explainers[gameId];
}
