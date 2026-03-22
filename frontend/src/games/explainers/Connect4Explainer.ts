import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';
import type { Connect4State, Connect4Move } from '../Connect4Engine';
import { Connect4Engine } from '../Connect4Engine';

export class Connect4Explainer implements GameExplainer<Connect4State, Connect4Move> {
  explain(state: Connect4State, move: Connect4Move, analysis?: GameAnalysis<Connect4Move>): MoveExplanation {
    const reasons: string[] = [];
    const engine = new Connect4Engine();
    
    let summary = `Dropped piece in Col ${move.col + 1}`;
    let impact: "strong" | "neutral" | "weak" = "neutral";
    
    const board = state.board.map(r => [...r]);
    let droppedRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (board[r][move.col] === null) {
        board[r][move.col] = state.currentPlayer;
        droppedRow = r;
        break;
      }
    }

    let isWin = false;
    let isBlock = false;
    let is3InRow = false;
    let opponentWinsNext = false;

    if (droppedRow !== -1) {
      const { winner } = engine.checkWin(board);
      if (winner) isWin = true;
      
      const opponentBoard = state.board.map(r => [...r]);
      opponentBoard[droppedRow][move.col] = state.currentPlayer === 'Alice' ? 'Bob' : 'Alice';
      const { winner: oppWinner } = engine.checkWin(opponentBoard);
      if (oppWinner) isBlock = true;

      const nextState = engine.applyMove(state, move);
      for (let c = 0; c < 7; c++) {
         if (engine.isValidMove(nextState, {col: c})) {
            const st1 = JSON.parse(JSON.stringify(nextState));
            let r1 = -1;
            for (let r = 5; r >= 0; r--) {
               if (st1.board[r][c] === null) { st1.board[r][c] = state.currentPlayer; r1 = r; break; }
            }
            if (r1 !== -1 && engine.checkWin(st1.board).winner) {
               is3InRow = true;
            }

            const st2 = JSON.parse(JSON.stringify(nextState));
            let r2 = -1;
            const opponent = state.currentPlayer === 'Alice' ? 'Bob' : 'Alice';
            for (let r = 5; r >= 0; r--) {
               if (st2.board[r][c] === null) { st2.board[r][c] = opponent; r2 = r; break; }
            }
            if (r2 !== -1 && engine.checkWin(st2.board).winner) {
               opponentWinsNext = true;
            }
         }
      }
    }

    const isCenter = move.col === 3;
    const isEdge = move.col === 0 || move.col === 6;

    if (isWin) reasons.push("Creates winning line");
    else if (opponentWinsNext) reasons.push("Blunder: Allows immediate opponent win");
    else if (isBlock) reasons.push("Blocks opponent threat");
    else if (is3InRow) reasons.push("Builds a 3-in-a-row threat");
    else if (isCenter) reasons.push("Controls center column");
    else if (isEdge) reasons.push("Low influence edge move");

    if (isWin) {
      impact = "strong";
      summary = `⭐ ` + summary;
    } else if (opponentWinsNext) {
      impact = "weak";
      summary = `⚠️ ` + summary;
    } else if (isBlock || is3InRow || isCenter) {
      impact = "strong";
      summary = `⭐ ` + summary;
    } else if (isEdge) {
      impact = "weak";
      summary = `⚠️ ` + summary;
    } else {
      impact = "neutral";
    }

    if (!isWin && analysis && analysis.optimalMove) {
      if (analysis.optimalMove.col !== move.col) {
          impact = "weak";
          summary = summary.replace('⭐ ', '').replace('⚠️ ', '');
          summary = `⚠️ ` + summary;
          if (!reasons.includes("Suboptimal strategic play") && !isEdge) reasons.push("Suboptimal strategic play");
      } else {
          impact = "strong";
          summary = summary.replace('⚠️ ', '').replace('⭐ ', '');
          summary = `⭐ ` + summary;
      }
    }

    return { summary, impact, reasons };
  }
}
