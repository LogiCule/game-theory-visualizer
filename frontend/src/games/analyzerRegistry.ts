import { StoneGameAnalyzer } from './analyze/StoneGameAnalyzer';
import { StoneGame2Analyzer } from './analyze/StoneGame2Analyzer';
import { StoneGame3Analyzer } from './analyze/StoneGame3Analyzer';
import { NimGameAnalyzer } from './analyze/NimGameAnalyzer';
import { TicTacToeAnalyzer } from './analyze/TicTacToeAnalyzer';
import { Connect4Analyzer } from './analyze/Connect4Analyzer';
import type { GameAnalyzer } from './core/GameAnalyzer';

export function getAnalyzerForGame(gameId: string): GameAnalyzer<any, any> | null {
  switch (gameId) {
    case 'stone-game-1':
      return new StoneGameAnalyzer();
    case 'stone-game-2':
      return new StoneGame2Analyzer();
    case 'stone-game-3':
      return new StoneGame3Analyzer();
    case 'nim-game':
      return new NimGameAnalyzer();
    case 'tic-tac-toe':
      return new TicTacToeAnalyzer();
    case 'connect-4':
      return new Connect4Analyzer();
    default:
      return null;
  }
}
