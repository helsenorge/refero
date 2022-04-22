/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

// eslint-disable-next-line @typescript-eslint/no-empty-function
global.define = () => {};

var _enzymeAdapterReact = require('@wojtekmaj/enzyme-adapter-react-17');
var _enzyme = require('enzyme');
var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

// Setting up enzyme for use with react 16
(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default(), disableLifecycleMethods: true });

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
