/*  The structured clone global is needed to fix error: "StructuredCopy is not defined"
 *  Ended up using ungap npm package to resolve this:
 *     1) It it is very similar to structuredClone ( which is needed for some of the tests that do actual deep copies )
 *     2) Avoid complications using a hybrid of test environments for different tests
 *     3) The package seems stable ( lot of downloads )
 */
import '@testing-library/jest-dom';
import structuredClone from '@ungap/structured-clone';
import React from 'react';

global.structuredClone = global.structuredClone || structuredClone;
global.React = React;
class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe(target) {
    this.callback([{ target, isIntersecting: true }]);
  }

  unobserve(target) {}

  disconnect() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();
