import { vi } from 'vitest';

Object.defineProperty(window, 'fetch', {
  value: vi.fn(() => {
    return Promise.resolve();
  }),
});
