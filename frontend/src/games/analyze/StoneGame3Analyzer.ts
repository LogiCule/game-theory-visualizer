import type { GameAnalyzer, GameAnalysis } from '../core/GameAnalyzer';
import type { StoneGame3State, StoneGame3Move } from '../StoneGame3Engine';

export class StoneGame3Analyzer implements GameAnalyzer<StoneGame3State, StoneGame3Move> {
  analyze(state: StoneGame3State): GameAnalysis<StoneGame3Move> {
    const piles = state.piles;
    const n = piles.length;

    if (n === 0) {
      const diff = state.scores.Alice - state.scores.Bob;
      let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
      if (diff > 0) winner = 'Alice';
      if (diff < 0) winner = 'Bob';
      return { winner, scoreDiff: diff };
    }

    const dp = new Array(n + 1).fill(-Infinity);
    dp[n] = 0; 

    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let x = 1; x <= 3 && i + x <= n; x++) {
            sum += piles[i + x - 1];
            dp[i] = Math.max(dp[i], sum - dp[i + x]);
        }
    }

    let bestX = 1;
    let maxDiff = -Infinity;
    let sum = 0;
    for (let x = 1; x <= 3 && x <= n; x++) {
        sum += piles[x - 1];
        const diff = sum - dp[x];
        if (diff > maxDiff) {
            maxDiff = diff;
            bestX = x;
        }
    }

    const marginFromRemaining = maxDiff; // dp[0] conceptually
    const opponent = state.currentPlayer === 'Alice' ? 'Bob' : 'Alice';
    const currentScoreDiff = state.scores[state.currentPlayer] - state.scores[opponent];
    
    const finalDiffForCurrent = currentScoreDiff + marginFromRemaining;
    const finalDiffForAlice = state.currentPlayer === 'Alice' ? finalDiffForCurrent : -finalDiffForCurrent;
    
    let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
    if (finalDiffForAlice > 0) winner = 'Alice';
    else if (finalDiffForAlice < 0) winner = 'Bob';

    return {
      winner,
      optimalMove: bestX,
      scoreDiff: finalDiffForAlice
    };
  }
}
