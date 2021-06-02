import { isIE11 } from './index';

// Purpose: Workaround for buggy IE11 behaviour.
//
// Description of buggy behaviour: See bug #187484
//
// Description of workaround: Force a re-render of the body and its containing
//   elements by adjusting the lineHeight-property of the body element.
//   This function is meant to be invoked from componentDidUpdate(), and so
//   will be invoked several times. However, Assigning lineHeight a value it
//   already has does not trigger a re-render, so we have to make sure we
//   assign it a new value each time it is called.
export function IE11HackToWorkAroundBug187484(): void {
  if (isIE11()) {
    window.setTimeout(function() {
      const heights = ['1.51', '1.5'];
      const elem = document.getElementsByTagName('body')[0];
      const currentHeight = elem.style.lineHeight || '1.5';
      const index = heights.indexOf(currentHeight);
      const newHeight = heights[(index + 1) % 2];

      elem.style.lineHeight = newHeight;
    });
  }
}
