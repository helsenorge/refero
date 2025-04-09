import { createAsyncThunk } from '@reduxjs/toolkit';

import type { Form } from './../form';
import type { NewValuePayload } from '@/actions/newValue';

export const calculateEnableWhenAsync = createAsyncThunk<Form, { action: NewValuePayload; state: Form }>(
  'form/calculateEnableWhen',
  async ({ action, state }) => {
    return new Promise<Form>((resolve, reject) => {
      // Make sure your file actually resolves to a JS worker file.
      const worker = new Worker(new URL('./enableWhenWorker.ts', import.meta.url), { type: 'module' });

      worker.onmessage = (e: MessageEvent<{ state: Form }>) => {
        worker.terminate();
        console.log('Worker response:', e.data.state);
        resolve(e.data.state);
      };
      worker.onerror = error => {
        worker.terminate();
        reject(error);
      };

      worker.postMessage({ action, state });
    });
  }
);
