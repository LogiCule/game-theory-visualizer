import { getAnalyzerForGame } from '../games/analyzerRegistry';

self.onmessage = (event) => {
  const { requestId, gameId, state } = event.data;
  console.log("Worker running analysis for", gameId);

  const analyzer = getAnalyzerForGame(gameId);
  let result = null;

  if (analyzer) {
    result = analyzer.analyze(state);
  }

  self.postMessage({
    requestId,
    result
  });
};
