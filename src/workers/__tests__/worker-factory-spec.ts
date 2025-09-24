/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * We re-import the module under test fresh in each test so its module-level
 * state (queue, flags, worker instance) is clean.
 */
async function loadModule() {
  const mod = await import('../worker-factory'); // adjust path if file lives elsewhere
  return mod as {
    postTaskToFhirPathWorker: (questionnaireResponse: any, questionnaire: any) => Promise<{ fhirScores: any }>;
  };
}

/**
 * Minimal fake Worker we fully control in tests.
 * We only implement the surface used by your module.
 */
class FakeWorker {
  onmessage: ((ev: MessageEvent<any>) => void) | null = null;
  onerror: ((ev: ErrorEvent) => void) | null = null;

  // simulate different behaviors after postMessage
  constructor(private behavior: 'success' | 'error-message' | 'error-event') {}

  postMessage(_data: unknown) {
    queueMicrotask(() => {
      if (this.behavior === 'success') {
        this.onmessage?.({ data: { type: 'success', payload: { fhirScores: 'from-worker' } } } as any);
      } else if (this.behavior === 'error-message') {
        this.onmessage?.({
          data: { type: 'error', payload: { message: 'boom', stack: 'S' } },
        } as any);
      } else if (this.behavior === 'error-event') {
        // Fire an ErrorEvent-like shape; JSDOM’s ErrorEvent is fine, but we keep it simple.
        this.onerror?.({ message: 'CSP', error: new Error('CSP') } as any);
      }
    });
  }

  terminate() {
    /* noop */
  }
  addEventListener() {
    /* not used by module under test */
  }
  removeEventListener() {
    /* not used */
  }
}

type WorkerFactoryBehavior = { kind: 'success' } | { kind: 'throw' } | { kind: 'error-event' } | { kind: 'error-message' };

function mockWorkaroundWorker(behavior: WorkerFactoryBehavior) {
  // IMPORTANT: we must set the mock BEFORE importing the module under test
  vi.doMock('../WorkaroundWorker', () => {
    const fn = vi.fn(() => {
      switch (behavior.kind) {
        case 'success':
          return new FakeWorker('success') as unknown as Worker;
        case 'error-event':
          return new FakeWorker('error-event') as unknown as Worker;
        case 'error-message':
          return new FakeWorker('error-message') as unknown as Worker;
        case 'throw':
          throw new Error('CSP: worker blocked');
      }
    });
    return { WorkaroundWorker: fn };
  });
  return () => vi.importMock<typeof import('../WorkaroundWorker')>('../WorkaroundWorker');
}

function mockFhirPathExtensions() {
  const evaluateAllExpressions = vi.fn((qr: any) => ({ ...qr, evaluated: true }));
  const calculateFhirScore = vi.fn((_updated: any) => ({ source: 'main-thread' }));

  vi.doMock('@/util/FhirPathExtensions', () => {
    class FhirPathExtensions {
      constructor(_q: any) {}
      evaluateAllExpressions = evaluateAllExpressions;
      calculateFhirScore = calculateFhirScore;
    }
    // AnswerPad is a type only at runtime, so no need to export anything special.
    return { FhirPathExtensions };
  });

  return { evaluateAllExpressions, calculateFhirScore };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('worker-factory fallback behavior', () => {
  const qr = { id: 'qr1' };
  const q = { id: 'q1' };

  it('uses the worker on success and does NOT hit main thread', async () => {
    mockWorkaroundWorker({ kind: 'success' });
    const { evaluateAllExpressions, calculateFhirScore } = mockFhirPathExtensions();

    const { postTaskToFhirPathWorker } = await loadModule();
    const res = await postTaskToFhirPathWorker(qr, q);

    expect(res).toEqual({ fhirScores: 'from-worker' });
    expect(evaluateAllExpressions).not.toHaveBeenCalled();
    expect(calculateFhirScore).not.toHaveBeenCalled();
  });

  it('falls back to main thread when worker constructor throws (e.g. CSP), and disables worker for the session', async () => {
    const workaroundSpyFactory = mockWorkaroundWorker({ kind: 'throw' });
    const { evaluateAllExpressions, calculateFhirScore } = mockFhirPathExtensions();

    const { postTaskToFhirPathWorker } = await loadModule();

    const first = await postTaskToFhirPathWorker(qr, q);
    expect(first).toEqual({ fhirScores: { source: 'main-thread' } });
    expect(evaluateAllExpressions).toHaveBeenCalledTimes(1);
    expect(calculateFhirScore).toHaveBeenCalledTimes(1);

    // Second call should NOT try to build another worker (disabled flag), still main thread
    const second = await postTaskToFhirPathWorker(qr, q);
    expect(second).toEqual({ fhirScores: { source: 'main-thread' } });

    const workaroundModule = await workaroundSpyFactory();
    // Only attempted once (first call); second call used cached disabled state
    expect((workaroundModule as any).WorkaroundWorker).toHaveBeenCalledTimes(1);
  });

  it('on async worker.onerror: resolves current task via main-thread and disables worker for future tasks', async () => {
    const workaroundSpyFactory = mockWorkaroundWorker({ kind: 'error-event' });
    const { evaluateAllExpressions, calculateFhirScore } = mockFhirPathExtensions();

    const { postTaskToFhirPathWorker } = await loadModule();

    const first = await postTaskToFhirPathWorker(qr, q);
    expect(first).toEqual({ fhirScores: { source: 'main-thread' } });
    expect(evaluateAllExpressions).toHaveBeenCalledTimes(1);
    expect(calculateFhirScore).toHaveBeenCalledTimes(1);

    // Next call should immediately use main-thread (disabled)
    const second = await postTaskToFhirPathWorker(qr, q);
    expect(second).toEqual({ fhirScores: { source: 'main-thread' } });

    const workaroundModule = await workaroundSpyFactory();
    expect((workaroundModule as any).WorkaroundWorker).toHaveBeenCalledTimes(1);
  });

  it("on worker message {type:'error'}: rejects current task and disables; next task falls back to main thread", async () => {
    const workaroundSpyFactory = mockWorkaroundWorker({ kind: 'error-message' });
    const { evaluateAllExpressions, calculateFhirScore } = mockFhirPathExtensions();

    const { postTaskToFhirPathWorker } = await loadModule();

    await expect(postTaskToFhirPathWorker(qr, q)).rejects.toThrow(/boom|unknown/i);

    const second = await postTaskToFhirPathWorker(qr, q);
    expect(second).toEqual({ fhirScores: { source: 'main-thread' } });
    expect(evaluateAllExpressions).toHaveBeenCalledTimes(1);
    expect(calculateFhirScore).toHaveBeenCalledTimes(1);

    const workaroundModule = await workaroundSpyFactory();
    expect((workaroundModule as any).WorkaroundWorker).toHaveBeenCalledTimes(1);
  });

  it('processes queued tasks sequentially with a healthy worker', async () => {
    mockWorkaroundWorker({ kind: 'success' });
    mockFhirPathExtensions();

    const { postTaskToFhirPathWorker } = await loadModule();

    const p1 = postTaskToFhirPathWorker({ id: 'qrA' }, { id: 'qA' });
    const p2 = postTaskToFhirPathWorker({ id: 'qrB' }, { id: 'qB' });

    await expect(p1).resolves.toEqual({ fhirScores: 'from-worker' });
    await expect(p2).resolves.toEqual({ fhirScores: 'from-worker' });
  });
});
