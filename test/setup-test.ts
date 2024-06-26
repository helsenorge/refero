import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import './__mocks__/matchMedia';
import './__mocks__/IntersectionObserver';
// import './__mocks__/ResizeObserver';
// import './__mocks__/useLayoutEvent';
// import './__mocks__/useSize';
// import './__mocks__/useHover';
// import './__mocks__/usePseudoClasses';
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
window.HTMLElement.prototype.scrollIntoView = vi.fn();
const scrollIntoViewMock = vi.fn();
vi.stubGlobal('scrollIntoView', scrollIntoViewMock);
afterEach(() => {
  vi.useRealTimers();
});
