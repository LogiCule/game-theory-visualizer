import type { GameAnalyzer, GameAnalysis } from '../core/GameAnalyzer';
import type { StoneGameState, StoneGameMove } from '../StoneGameEngine';

export class StoneGameAnalyzer implements GameAnalyzer<StoneGameState, StoneGameMove> {
  analyze(state: StoneGameState): GameAnalysis<StoneGameMove> {
    const piles = state.piles;
    const n = piles.length;
    
    if (n === 0) {
      const diff = state.scores.Alice - state.scores.Bob;
      let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
      if (diff > 0) winner = 'Alice';
      if (diff < 0) winner = 'Bob';
      return { winner, scoreDiff: diff };
    }
    
    const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) dp[i][i] = piles[i];

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        let j = i + len - 1;
        dp[i][j] = Math.max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1]);
      }
    }

    const currentScoreDiff = state.scores[state.currentPlayer] - state.scores[state.currentPlayer === 'Alice' ? 'Bob' : 'Alice'];
    const maxFutureDiffForCurrent = dp[0][n - 1];
    
    // The final absolute diff from the perspective of currentPlayer
    const finalDiffForCurrent = currentScoreDiff + maxFutureDiffForCurrent;
    
    // Convert this to Alice's perspective for the winner determination
    const finalDiffForAlice = state.currentPlayer === 'Alice' ? finalDiffForCurrent : -finalDiffForCurrent;
    
    let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
    if (finalDiffForAlice > 0) winner = 'Alice';
    else if (finalDiffForAlice < 0) winner = 'Bob';

    let optimalMove: StoneGameMove = 'left';
    if (n > 1) {
      const pickLeftDiff = piles[0] - dp[1][n - 1];
      const pickRightDiff = piles[n - 1] - dp[0][n - 2];
      optimalMove = pickLeftDiff >= pickRightDiff ? 'left' : 'right';
    }

    return {
      winner,
      optimalMove,
      scoreDiff: finalDiffForAlice
    };
  }
}
