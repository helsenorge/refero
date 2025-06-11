import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import './__mocks__/matchMedia';
import './__mocks__/IntersectionObserver';
import { cleanup } from '@testing-library/react';
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
    addListener: vi.fn(), // deprecated but still used in some libraries
    removeListener: vi.fn(), // deprecated but still used in some libraries
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
vi.mock('@/workers/fhir-path.worker.ts?worker', () => {
  // This is a fake Worker class constructor that we will export as the `default`.
  const MockWorker = vi.fn().mockImplementation(() => {
    return {
      // Mock the methods
      postMessage: vi.fn(),
      terminate: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),

      onmessage: vi.fn(),
      onerror: vi.fn(),
    };
  });

  return {
    default: MockWorker,
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  cleanup();
});
