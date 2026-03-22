import type { TreeNode } from '../types/tree';

export class TreeBuilder {
  static build(engine: any, state: any, maxDepth: number, currentDepth: number = 0, parentId: string = "root"): TreeNode {
    const node: TreeNode = {
      id: parentId,
      score: 0,
      depth: currentDepth,
    };
    
    if (currentDepth === 0) {
      let currentScore = 0;
      if (engine.evaluate) {
        currentScore = engine.evaluate(state);
      } else if (engine.getResult) {
         const res = engine.getResult(state);
         if (res === 'Alice') currentScore = 100;
         else if (res === 'Bob') currentScore = -100;
      }

      if (currentScore > 0 && currentScore < 100) {
        node.label = `+${currentScore}`;
      } else if (currentScore === 100) {
        node.label = 'A';
      } else if (currentScore === -100) {
        node.label = 'B';
      } else {
        node.label = String(currentScore);
      }
    }

    // 1. Evaluate leaf node
    if (currentDepth >= maxDepth || engine.isTerminal(state) || state.gameOver) {
      if (engine.evaluate) {
        node.score = engine.evaluate(state);
      } else if (engine.getResult) {
        const res = engine.getResult(state);
        if (res === 'Alice') node.score = 100;
        else if (res === 'Bob') node.score = -100;
        else node.score = 0;
      }
      
      // format score
      if (typeof node.score === 'number' && node.score > 0 && node.score < 100) {
        node.score = `+${node.score}`;
      } else if (node.score === 100) node.score = 'A';
      else if (node.score === -100) node.score = 'B';
      
      return node;
    }

    // 2. Expand children (limit to 5)
    let moves = engine.getValidMoves(state);
    moves = moves.slice(0, 5);

    let bestScoreValue = state.currentPlayer === 'Alice' ? -Infinity : Infinity;
    let bestChildIndex = -1;

    node.children = moves.map((move: any, index: number) => {
      // Lightweight applyMove avoiding heavy history copy
      const nextState = engine.applyMove(state, move);

      let label: string | undefined = undefined;
      if (nextState.history && nextState.history.length > 0) {
        const lastEntry = nextState.history[nextState.history.length - 1];
        if (lastEntry && lastEntry.description) {
           const match = lastEntry.description.match(/\((\d+)\)/);
           if (match) {
             label = state.currentPlayer === 'Alice' ? `+${match[1]}` : `-${match[1]}`;
           }
        }
      }
      
      if (nextState.history) {
        nextState.history = []; // free memory eagerly
      }

      const childId = `${parentId}-${index}`;
      const child = this.build(engine, nextState, maxDepth, currentDepth + 1, childId);
      child.move = move;
      if (label) {
        child.label = label;
      }

      // Extract numerical value for Minimax decision
      let childScoreVal = 0;
      if (typeof child.score === 'number') {
        childScoreVal = child.score;
      } else if (typeof child.score === 'string') {
        if (child.score.startsWith('+') || child.score.startsWith('-')) {
          childScoreVal = parseInt(child.score);
        } else if (child.score === 'A') {
          childScoreVal = 100;
        } else if (child.score === 'B') {
          childScoreVal = -100;
        }
      }

      // Find the best path
      if (state.currentPlayer === 'Alice') {
        if (childScoreVal > bestScoreValue) {
          bestScoreValue = childScoreVal;
          bestChildIndex = index;
        }
      } else {
        if (childScoreVal < bestScoreValue) {
          bestScoreValue = childScoreVal;
          bestChildIndex = index;
        }
      }

      return child;
    });

    // 3. Propagate score up
    if (bestChildIndex !== -1 && node.children && node.children[bestChildIndex]) {
      node.children[bestChildIndex].isBest = true;
      node.score = bestScoreValue;
    } else {
      node.score = 0;
    }
    
    // format score
    if (typeof node.score === 'number' && node.score > 0 && node.score < 100) {
      node.score = `+${node.score}`;
    } else if (node.score === 100) node.score = 'A';
    else if (node.score === -100) node.score = 'B';

    return node;
  }
}
