import { StoneGameEngine } from './StoneGameEngine';
import { StoneGame2Engine } from './StoneGame2Engine';
import { StoneGame3Engine } from './StoneGame3Engine';
import { NimGameEngine } from './NimGameEngine';
import { TicTacToeEngine } from './TicTacToeEngine';
import { TwoPlayerGameEngine } from './core/TwoPlayerGameEngine';

export function getEngineForGame(gameId: string): TwoPlayerGameEngine<any, any, any> | null {
  switch (gameId) {
    case 'stone-game-1':
      return new StoneGameEngine();
    case 'stone-game-2':
      return new StoneGame2Engine();
    case 'stone-game-3':
      return new StoneGame3Engine();
    case 'nim-game':
      return new NimGameEngine();
    case 'tic-tac-toe':
      return new TicTacToeEngine();
    default:
      return null;
  }
}
