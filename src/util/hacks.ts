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
export function IE11HackToWorkAroundBug187484() {
  if (isIE11()) {
    window.setTimeout(function() {
      var heights = ['1.51', '1.5'];
      var elem = document.getElementsByTagName('body')[0];
      var currentHeight = elem.style.lineHeight || '1.5';
      var index = heights.indexOf(currentHeight);
      var newHeight = heights[(index + 1) % 2];

      elem.style.lineHeight = newHeight;
    });
  }
}

function isIE11() {
  // tslint:disable-next-line:no-string-literal
  return !!window['MSInputMethodContext'] && !!document['documentMode'];
}
