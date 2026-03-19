import type { GameAnalyzer, GameAnalysis } from '../core/GameAnalyzer';
import type { NimState, NimMove } from '../NimGameEngine';

export class NimGameAnalyzer implements GameAnalyzer<NimState, NimMove> {
  analyze(state: NimState): GameAnalysis<NimMove> {
    if (state.stones === 0) {
      return { winner: state.currentPlayer === 'Alice' ? 'Bob' : 'Alice', scoreDiff: undefined };
    }
    
    const isWiningPosition = (state.stones % 4 !== 0);
    const winner = isWiningPosition ? state.currentPlayer : (state.currentPlayer === 'Alice' ? 'Bob' : 'Alice');
    
    let optimalMoveValue = state.stones % 4;
    let optimalMove: NimMove = (optimalMoveValue === 0 ? 1 : optimalMoveValue) as NimMove;

    return {
      winner,
      optimalMove
    };
  }
}
