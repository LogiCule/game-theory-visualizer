import { StoneGameAnalyzer } from './analyze/StoneGameAnalyzer';
import { NimGameAnalyzer } from './analyze/NimGameAnalyzer';
import type { GameAnalyzer } from './core/GameAnalyzer';

export function getAnalyzerForGame(gameId: string): GameAnalyzer<any, any> | null {
  switch (gameId) {
    case 'stone-game-1':
      return new StoneGameAnalyzer();
    case 'nim-game':
      return new NimGameAnalyzer();
    default:
      return null;
  }
}
