import type { GameAnalyzer, GameAnalysis } from '../core/GameAnalyzer';
import type { StoneGame2State, StoneGame2Move } from '../StoneGame2Engine';

export class StoneGame2Analyzer implements GameAnalyzer<StoneGame2State, StoneGame2Move> {
  analyze(state: StoneGame2State): GameAnalysis<StoneGame2Move> {
    const piles = state.piles;
    const M = state.M;
    const n = piles.length;

    if (n === 0) {
      const diff = state.scores.Alice - state.scores.Bob;
      let winner: 'Alice' | 'Bob' | 'Tie' = 'Tie';
      if (diff > 0) winner = 'Alice';
      if (diff < 0) winner = 'Bob';
      return { winner, scoreDiff: diff };
    }

    const suffixSum = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        suffixSum[i] = suffixSum[i + 1] + piles[i];
    }

    const memo = new Map<string, number>();

    const dfs = (i: number, m: number): number => {
        if (i === n) return 0;
        if (i + 2 * m >= n) return suffixSum[i]; 

        const key = `${i},${m}`;
        if (memo.has(key)) return memo.get(key)!;

        let maxStones = 0;
        for (let x = 1; x <= 2 * m; x++) {
            maxStones = Math.max(maxStones, suffixSum[i] - dfs(i + x, Math.max(m, x)));
        }

        memo.set(key, maxStones);
        return maxStones;
    };

    let bestX = 1;
    let maxStones = -1;
    for (let x = 1; x <= Math.min(2 * M, n); x++) {
        const stones = suffixSum[0] - dfs(x, Math.max(M, x));
        if (stones > maxStones) {
            maxStones = stones;
            bestX = x;
        }
    }

    const marginFromRemaining = 2 * maxStones - suffixSum[0];
    const opponent = state.currentPlayer === 'Alice' ? 'Bob' : 'Alice';
    const currentScoreDiff = state.scores[state.currentPlayer] - state.scores[opponent];
    
    // The final absolute diff from the perspective of currentPlayer
    const finalDiffForCurrent = currentScoreDiff + marginFromRemaining;
    
    // Convert this to Alice's perspective for scoreDiff display
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
