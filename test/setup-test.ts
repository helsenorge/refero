import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import './__mocks__/matchMedia';
import './__mocks__/IntersectionObserver';
// import './__mocks__/ResizeObserver';
// import './__mocks__/useLayoutEvent';
// import './__mocks__/useSize';
// import './__mocks__/useHover';
// import './__mocks__/usePseudoClasses';

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
vi.mock('@/workers/fhir-path.worker.ts', async importOriginal => {
  // Get the original module's exports if needed (optional)
  const original = await importOriginal<typeof import('@/workers/fhir-path.worker.ts')>();

  // Create a fake class that we can spy on
  const MockWorker = vi.fn(() => {
    // Constructor logic if needed (usually not)
  });

  // Mock the methods on the prototype. This is what instances will inherit.
  MockWorker.prototype.postMessage = vi.fn();
  MockWorker.prototype.terminate = vi.fn();
  MockWorker.prototype.addEventListener = vi.fn();
  MockWorker.prototype.removeEventListener = vi.fn();
  // Ensure onmessage/onerror are mock functions on the instance
  Object.defineProperty(MockWorker.prototype, 'onmessage', {
    get: vi.fn(() => vi.fn()),
    set: vi.fn(),
  });
  Object.defineProperty(MockWorker.prototype, 'onerror', {
    get: vi.fn(() => vi.fn()),
    set: vi.fn(),
  });

  return {
    ...original, // Spread original exports
    default: MockWorker, // Override the default export with our mock class
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  cleanup();
});
