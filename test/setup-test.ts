import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import './__mocks__/matchMedia';
import './__mocks__/IntersectionObserver';
// import './__mocks__/ResizeObserver';
// import './__mocks__/useLayoutEvent';
// import './__mocks__/useSize';
// import './__mocks__/useHover';
// import './__mocks__/usePseudoClasses';
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
  get() {
    if (typeof globalThis.self !== 'undefined') {
      return globalThis.self.IS_REACT_ACT_ENVIRONMENT;
    }
  },
  set(value) {
    if (typeof globalThis.self !== 'undefined') {
      globalThis.self.IS_REACT_ACT_ENVIRONMENT = value;
    }
  },
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
class MockDataTransfer {
  files: File[];

  constructor() {
    this.files = [];
  }
  items = {
    add: (file: File): void => {
      this.files.push(file);
    },
  };
}

vi.stubGlobal('DataTransfer', MockDataTransfer);
window.HTMLElement.prototype.scrollIntoView = vi.fn();
const scrollIntoViewMock = vi.fn();
vi.stubGlobal('scrollIntoView', scrollIntoViewMock);
afterEach(() => {
  vi.useRealTimers();
});
