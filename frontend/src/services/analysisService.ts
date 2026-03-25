import type { AIDifficulty } from '../ai/AIStrategy';

export class AnalysisService {
  private worker: Worker;
  private currentRequestId = 0;

  constructor() {
    this.worker = new Worker(new URL('../workers/gameWorker.ts', import.meta.url), { type: 'module' });
  }

  analyze(gameId: string, state: any, difficulty: AIDifficulty = 'hard'): Promise<any> {
    return this.sendRequest('analyze', gameId, state, difficulty);
  }

  getBestMove(
    gameId: string,
    state: any,
    difficulty: AIDifficulty = 'hard',
    onProgress?: (data: any) => void,
  ): Promise<any> {
    return this.sendRequest('bestMove', gameId, state, difficulty, onProgress);
  }

  private sendRequest(
    type: string,
    gameId: string,
    state: any,
    difficulty: AIDifficulty,
    onProgress?: (data: any) => void,
  ): Promise<any> {
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

      this.worker.postMessage({ requestId, type, gameId, state, difficulty });
    });
  }
}

export const analysisService = new AnalysisService();

// ─── localStorage helpers ─────────────────────────────────────────────────────

const DIFFICULTY_KEY = 'ai_difficulty';

export function loadDifficulty(): AIDifficulty {
  const stored = localStorage.getItem(DIFFICULTY_KEY);
  if (stored === 'easy' || stored === 'medium' || stored === 'hard') return stored;
  return 'hard'; // sensible default
}

export function saveDifficulty(d: AIDifficulty): void {
  localStorage.setItem(DIFFICULTY_KEY, d);
}

