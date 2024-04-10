import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

// Setting up enzyme for use with React based on node 18 requirements
Enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

/*  The structured clone global is needed to fix error: "StructuredCopy is not defined"
 *  Ended up using ungap npm package to resolve this:
 *     1) It it is very similar to structuredClone ( which is needed for some of the tests that do actual deep copies )
 *     2) Avoid complications using a hybrid of test environments for different tests
 *     3) The package seems stable ( lot of downloads )
 */

import structuredClone from '@ungap/structured-clone';
global.structuredClone = global.structuredClone || structuredClone;

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
