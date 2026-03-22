import { getAnalyzerForGame } from '../games/analyzerRegistry';
import { getEngineForGame } from '../games/engineRegistry';
import { TreeBuilder } from './TreeBuilder';

self.onmessage = async (event) => {
  const { requestId, gameId, state, type } = event.data;
  console.log("Worker executing", type, gameId);

  let result = null;

  if (type === 'analyze') {
    const analyzer = getAnalyzerForGame(gameId);
    if (analyzer) {
      result = analyzer.analyze(state);
    }
    self.postMessage({ requestId, result, type });
  } else if (type === 'bestMove') {
    const engine = getEngineForGame(gameId);
    if (!engine || !engine.getOptimalMove) {
      self.postMessage({ requestId, result: null, type });
      return;
    }

    if (gameId === 'connect-4') {
      const depths = [3, 5, 7];
      for (let i = 0; i < depths.length; i++) {
        const depth = depths[i];
        const move = (engine as any).getOptimalMove(state, depth);
        
        if (i === depths.length - 1) {
          self.postMessage({ requestId, result: move, depth, type });
        } else {
          self.postMessage({ requestId, result: move, depth, type: 'progress' });
        }
      }
    } else {
       result = engine.getOptimalMove(state);
       self.postMessage({ requestId, result, type });
    }
  } else if (type === 'tree') {
    const engine = getEngineForGame(gameId);
    if (!engine) {
      self.postMessage({ requestId, result: null, type });
      return;
    }
    const depth = event.data.depth || 2;
    result = TreeBuilder.build(engine, state, depth);
    self.postMessage({ requestId, result, type });
  }
};
