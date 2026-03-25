import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';
import type { Connect4State, Connect4Move } from '../Connect4Engine';
import { Connect4Engine } from '../Connect4Engine';
import {
  classifyByDiff, computeConfidence, difficultyNote,
  verdictLabel,
} from '../core/GameExplainer';
import type { AIDifficulty } from '../../ai/AIStrategy';

export class Connect4Explainer implements GameExplainer<Connect4State, Connect4Move> {
  explain(
    state: Connect4State,
    move: Connect4Move,
    analysis?: GameAnalysis<Connect4Move>,
    difficulty?: AIDifficulty,
  ): MoveExplanation {
    const engine = new Connect4Engine();
    const opponent = state.currentPlayer === 'Alice' ? 'Bob' : 'Alice';

    // ── 1. Apply move to find the landed row ─────────────────────────────────
    const board = state.board.map(r => [...r]);
    let droppedRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (board[r][move.col] === null) { board[r][move.col] = state.currentPlayer; droppedRow = r; break; }
    }

    // ── 2. Tactical detections ────────────────────────────────────────────────
    const isWin = droppedRow !== -1 && !!engine.checkWin(board).winner;

    let isBlock = false;
    if (!isWin && droppedRow !== -1) {
      const blockBoard = state.board.map(r => [...r]);
      blockBoard[droppedRow][move.col] = opponent;
      isBlock = !!engine.checkWin(blockBoard).winner;
    }

    let is3InRow = false;
    let opponentWinsNext = false;
    if (!isWin && droppedRow !== -1) {
      const nextState = engine.applyMove(state, move);
      for (let c = 0; c < 7; c++) {
        if (!engine.isValidMove(nextState, { col: c })) continue;
        const myBoard = nextState.board.map(r => [...r]);
        for (let r2 = 5; r2 >= 0; r2--) {
          if (myBoard[r2][c] === null) { myBoard[r2][c] = state.currentPlayer; break; }
        }
        if (engine.checkWin(myBoard).winner) is3InRow = true;

        const oppBoard = nextState.board.map(r => [...r]);
        for (let r2 = 5; r2 >= 0; r2--) {
          if (oppBoard[r2][c] === null) { oppBoard[r2][c] = opponent; break; }
        }
        if (engine.checkWin(oppBoard).winner) opponentWinsNext = true;
      }
    }

    const isCenter = move.col === 3;
    const isEdge   = move.col === 0 || move.col === 6;

    // ── 3. Score diff ─────────────────────────────────────────────────────────
    const isOptimal = analysis?.optimalMove
      ? analysis.optimalMove.col === move.col
      : (isWin || isBlock || is3InRow || isCenter);

    let diff = 0;
    if (!isOptimal) {
      if (opponentWinsNext && !isBlock) diff = -6;
      else if (analysis?.scoreDiff !== undefined) diff = -Math.abs(analysis.scoreDiff / 1000);
      else diff = isEdge ? -2 : -1;
    }
    const displayDiff = Math.max(-9, Math.min(9, Math.round(diff)));

    // ── 4. Verdict & confidence ───────────────────────────────────────────────
    const verdict = isWin ? 'optimal' : classifyByDiff(diff, opponentWinsNext && !isBlock);
    const confidence = isWin || isBlock
      ? 'high'
      : is3InRow
        ? 'medium'
        : computeConfidence(Math.abs(analysis?.scoreDiff ?? 1));

    // ── 5. Build ordered reasons ──────────────────────────────────────────────
    const reasons: string[] = [];
    const tags: string[] = [];

    if (isWin) { reasons.push('Creates an immediate winning line'); tags.push('win'); }
    else if (opponentWinsNext && !isBlock) {
      reasons.push('Allows opponent to create a winning line next turn'); tags.push('blunder');
    }

    if (reasons.length < 3 && isBlock) { reasons.push("Blocks opponent's winning threat"); tags.push('blocking'); }
    if (reasons.length < 3 && is3InRow && !isWin) { reasons.push('Builds a 3-in-a-row — creates immediate threat'); tags.push('threat'); }
    if (reasons.length < 3 && isCenter) { reasons.push('Controls center column — highest board influence'); tags.push('center control'); }
    if (reasons.length < 3 && isEdge && !isWin && !isBlock) {
      reasons.push('Edge column drop — low board influence, avoids center control'); tags.push('edge');
    }

    if (reasons.length === 0) {
      if (isOptimal) reasons.push('Develops positional advantage through board structure');
      else reasons.push('Better alternatives maintain stronger board control');
    }

    const dNote = difficulty ? difficultyNote(difficulty, verdict) : null;
    if (dNote && reasons.length < 3) reasons.push(dNote);

    // ── 6. Compose summary ────────────────────────────────────────────────────
    const scoreStr = displayDiff !== 0 ? ` (${displayDiff > 0 ? '+' : ''}${displayDiff})` : '';
    const confStr = ` • ${confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence`;
    const summary = `${verdictLabel[verdict]}${scoreStr}${confStr}`;

    return { summary, verdict, confidence, reasons, scoreImpact: displayDiff || undefined, tags };
  }
}
