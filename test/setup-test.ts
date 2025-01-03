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
afterEach(() => {
  vi.useRealTimers();
});
