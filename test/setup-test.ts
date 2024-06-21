import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

import './__mocks__/matchMedia';
import './__mocks__/IntersectionObserver';
// import './__mocks__/ResizeObserver';
// import './__mocks__/useLayoutEvent';
// import './__mocks__/useSize';
// import './__mocks__/useHover';
// import './__mocks__/usePseudoClasses';
window.HTMLElement.prototype.scrollIntoView = vi.fn();
