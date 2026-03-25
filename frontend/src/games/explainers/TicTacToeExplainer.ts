import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';
import type { TicTacToeState, TicTacToeMove } from '../TicTacToeEngine';
import { TicTacToeEngine } from '../TicTacToeEngine';
import {
  classifyByDiff, computeConfidence, difficultyNote,
  verdictLabel,
} from '../core/GameExplainer';
import type { AIDifficulty } from '../../ai/AIStrategy';

export class TicTacToeExplainer implements GameExplainer<TicTacToeState, TicTacToeMove> {
  explain(
    state: TicTacToeState,
    move: TicTacToeMove,
    analysis?: GameAnalysis<TicTacToeMove>,
    difficulty?: AIDifficulty,
  ): MoveExplanation {
    const engine = new TicTacToeEngine();
    const opponent = state.currentPlayer === 'Alice' ? 'Bob' : 'Alice';

    // ── 1. Tactical detections ────────────────────────────────────────────────

    const nextState = engine.applyMove(state, move);
    const isWin = !!nextState.winningLine;

    // Block check — would opponent win if they played here instead?
    const blockBoard = state.board.map(r => [...r]);
    blockBoard[move.row][move.col] = opponent;
    const isBlock = !!engine.checkWin(blockBoard).winner;

    // Fork check — does this move create 2+ winning threats?
    let myThreats = 0;
    if (!isWin) {
      for (const m of engine.getValidMoves(nextState)) {
        const fb = nextState.board.map(r => [...r]);
        fb[m.row][m.col] = state.currentPlayer;
        if (engine.checkWin(fb).winner) myThreats++;
      }
    }
    const isFork = myThreats >= 2;

    const isCenter = move.row === 1 && move.col === 1;

    // Immediate opponent win after this move (blunder signal)
    let opponentWinsNext = false;
    if (!isWin) {
      for (const m of engine.getValidMoves(nextState)) {
        const fb = nextState.board.map(r => [...r]);
        fb[m.row][m.col] = opponent;
        if (engine.checkWin(fb).winner) { opponentWinsNext = true; break; }
      }
    }

    // ── 2. Score diff from analysis ───────────────────────────────────────────
    const isOptimal = analysis?.optimalMove
      ? analysis.optimalMove.row === move.row && analysis.optimalMove.col === move.col
      : (isWin || isBlock || isFork || isCenter);

    let diff = 0;
    if (!isOptimal) {
      if (opponentWinsNext) diff = -5;
      else if (analysis?.optimalMove) diff = -2;
      else diff = -1;
    }

    // ── 3. Verdict & confidence ───────────────────────────────────────────────
    const verdict = isWin ? 'optimal' : classifyByDiff(diff, opponentWinsNext);
    const confidence = isWin || isBlock
      ? 'high'
      : isOptimal
        ? computeConfidence(Math.abs(analysis?.scoreDiff ?? 2))
        : 'medium';

    // ── 4. Build ordered reasons (max 3, most impactful first) ───────────────
    const reasons: string[] = [];
    const tags: string[] = [];

    if (isWin)                 { reasons.push('Creates a winning line — immediate victory'); tags.push('win'); }
    else if (opponentWinsNext) { reasons.push('Allows opponent to win on the next move'); tags.push('blunder'); }

    if (reasons.length < 3 && isBlock) { reasons.push("Blocks opponent's winning threat"); tags.push('blocking'); }
    if (reasons.length < 3 && isFork)  { reasons.push(`Creates ${myThreats} simultaneous winning threats (fork)`); tags.push('fork'); }
    if (reasons.length < 3 && isCenter) { reasons.push('Controls the center — maximizes connectivity'); tags.push('center control'); }

    if (reasons.length === 0 && isOptimal) reasons.push('Develops optimal positional advantage');
    if (reasons.length === 0 && !isOptimal) {
      if (analysis?.optimalMove) {
        const rowNames = ['Top', 'Center', 'Bottom'];
        const colNames = ['Left', 'Center', 'Right'];
        reasons.push(`Optimal was ${rowNames[analysis.optimalMove.row]} ${colNames[analysis.optimalMove.col]} — stronger board control`);
      } else {
        reasons.push('Low influence on board control');
      }
    }

    const dNote = difficulty ? difficultyNote(difficulty, verdict) : null;
    if (dNote && reasons.length < 3) reasons.push(dNote);

    // ── 5. Compose summary ────────────────────────────────────────────────────
    const scoreStr = diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : '';
    const confStr = ` • ${confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence`;
    const summary = `${verdictLabel[verdict]}${scoreStr}${confStr}`;

    return { summary, verdict, confidence, reasons, tags };
  }
}
