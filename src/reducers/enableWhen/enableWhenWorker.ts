// enableWhenWorker.ts
/// <reference lib="webworker" />

import { runEnableWhen } from './enableWhen'; // Ensure the path is correct
import { Form } from '../form';

import { NewValuePayload } from '@/actions/newValue';

self.onmessage = (e: MessageEvent<{ action: NewValuePayload; state: Form }>) => {
  const { action, state } = e.data;
  const newState = JSON.parse(JSON.stringify(state));
  const newAction = JSON.parse(JSON.stringify(action));
  console.log('Worker received action:', newAction);
  console.log('Worker received state:', newState);
  runEnableWhen(newAction, newState);
  self.postMessage({ state: newState });
};
self.onerror = (error: Event | string) => {
  console.error('Worker error:', error);
  self.close(); // Close the worker on error
};
