import type { GameExplainer, MoveExplanation } from '../core/GameExplainer';
import type { GameAnalysis } from '../core/GameAnalyzer';
import type { TicTacToeState, TicTacToeMove } from '../TicTacToeEngine';
import { TicTacToeEngine } from '../TicTacToeEngine';

export class TicTacToeExplainer implements GameExplainer<TicTacToeState, TicTacToeMove> {
  explain(state: TicTacToeState, move: TicTacToeMove, analysis?: GameAnalysis<TicTacToeMove>): MoveExplanation {
    const reasons: string[] = [];
    const engine = new TicTacToeEngine();
    let impact: "strong" | "neutral" | "weak" = "neutral";
    
    const rowNames = ['Top', 'Center', 'Bottom'];
    const colNames = ['Left', 'Center', 'Right'];
    let summary = `Played ${rowNames[move.row]} ${colNames[move.col]}`;
    
    const nextState = engine.applyMove(state, move);
    const isWin = !!nextState.winningLine;

    const opponent = state.currentPlayer === 'Alice' ? 'Bob' : 'Alice';
    const tempState = JSON.parse(JSON.stringify(state)); 
    tempState.board[move.row][move.col] = opponent;
    const isBlock = !!engine.checkWin(tempState.board).winner;

    let myThreats = 0;
    for (const nextMove of engine.getValidMoves(nextState)) {
       const st = JSON.parse(JSON.stringify(nextState));
       st.board[nextMove.row][nextMove.col] = state.currentPlayer;
       if (engine.checkWin(st.board).winner) myThreats++;
    }
    const isFork = myThreats >= 2;

    const isCenter = (move.row === 1 && move.col === 1);

    let opponentWinsNext = false;
    if (!isWin) {
       for (const oppMove of engine.getValidMoves(nextState)) {
          const st = JSON.parse(JSON.stringify(nextState));
          st.board[oppMove.row][oppMove.col] = opponent;
          if (engine.checkWin(st.board).winner) {
             opponentWinsNext = true;
             break;
          }
       }
    }

    if (isWin) reasons.push("Creates winning opportunity");
    else if (opponentWinsNext) reasons.push("Blunder: Allows immediate opponent win");
    else if (isBlock) reasons.push("Blocks opponent win");
    else if (isFork) reasons.push("Creates winning opportunity"); 
    else if (isCenter) reasons.push("Controls center");

    if (isWin) {
      impact = "strong";
      summary = `⭐ ` + summary;
    } else if (opponentWinsNext) {
      impact = "weak";
      summary = `⚠️ ` + summary;
    } else if (isBlock || isFork || isCenter) {
      impact = "strong";
      summary = `⭐ ` + summary;
    } else {
      if (analysis && analysis.optimalMove) {
        if (analysis.optimalMove.row === move.row && analysis.optimalMove.col === move.col) {
           impact = "strong";
           summary = `⭐ ` + summary;
           if (reasons.length === 0) reasons.push("Optimal positional play");
        } else {
           impact = "weak";
           summary = `⚠️ ` + summary;
           reasons.push("Suboptimal strategic play");
        }
      } else {
        impact = "neutral";
        if (reasons.length === 0) reasons.push("Develops board position");
      }
    }

    return { summary, impact, reasons };
  }
}
