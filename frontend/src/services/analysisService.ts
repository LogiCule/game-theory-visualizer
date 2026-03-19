export class AnalysisService {
  private worker: Worker;
  private requestId = 0;

  constructor() {
    this.worker = new Worker(new URL('../workers/gameWorker.ts', import.meta.url), { type: 'module' });
  }

  analyze(gameId: string, state: any): Promise<any> {
    return new Promise((resolve) => {
      const id = ++this.requestId;

      const handler = (e: MessageEvent) => {
        if (e.data.requestId === id) {
          this.worker.removeEventListener('message', handler);
          resolve(e.data.result);
        }
      };

      this.worker.addEventListener('message', handler);

      this.worker.postMessage({
        requestId: id,
        gameId,
        state
      });
    });
  }
}

export const analysisService = new AnalysisService();
