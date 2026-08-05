import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import './__mocks__/matchMedia';
import './__mocks__/IntersectionObserver';
import './__mocks__/ResizeObserver';

// Mock debounce to execute immediately in tests
vi.mock('@helsenorge/designsystem-react/utils/debounce', () => ({
  debounce: (fn: (...args: unknown[]) => unknown): [(...args: unknown[]) => unknown, () => void] => [fn, (): void => {}],
}));

import '@helsenorge/designsystem-react/__mocks__/useSize';

// @ts-expect-error global is not defined
global.IS_REACT_ACT_ENVIRONMENT = true;
// @ts-expect-error global is not defined
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// @ts-expect-error global is not defined
self.IS_REACT_ACT_ENVIRONMENT = true;
// @ts-expect-error global is not defined
window.IS_REACT_ACT_ENVIRONMENT = true;
// @ts-expect-error global is not defined
this.IS_REACT_ACT_ENVIRONMENT = true;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__REFERO_DEBUG = { enableWhen: true };
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
// class MockDataTransfer {
//   items = {
//     add: vi.fn(),
//   };
// }

// global.DataTransfer = MockDataTransfer;

window.HTMLElement.prototype.scrollIntoView = vi.fn();
const scrollIntoViewMock = vi.fn();
vi.stubGlobal('scrollIntoView', scrollIntoViewMock);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  cleanup();
});
