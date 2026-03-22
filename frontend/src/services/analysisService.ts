export class AnalysisService {
  private worker: Worker;
  private currentRequestId = 0;

  constructor() {
    this.worker = new Worker(new URL('../workers/gameWorker.ts', import.meta.url), { type: 'module' });
  }

  analyze(gameId: string, state: any): Promise<any> {
    return this.sendRequest('analyze', gameId, state);
  }

  getBestMove(gameId: string, state: any, onProgress?: (data: any) => void): Promise<any> {
    return this.sendRequest('bestMove', gameId, state, onProgress);
  }

  private sendRequest(type: string, gameId: string, state: any, onProgress?: (data: any) => void): Promise<any> {
    return new Promise((resolve) => {
      const requestId = ++this.currentRequestId;

      const handler = (e: MessageEvent) => {
        const data = e.data;

        if (data.requestId !== requestId) return;

        if (data.type === 'progress' && onProgress) {
          onProgress(data);
          return;
        }

        this.worker.removeEventListener('message', handler);
        resolve(data.result);
      };

      this.worker.addEventListener('message', handler);

      this.worker.postMessage({
        requestId,
        type,
        gameId,
        state
      });
    });
  }
}

export const analysisService = new AnalysisService();
