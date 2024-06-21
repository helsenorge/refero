class MutationObserver {
  observe(): void {
    // do nothing
  }
  disconnect(): void {
    // do nothing
  }
}

Object.defineProperty(window, 'MutationObserver', {
  value: MutationObserver,
});

export default MutationObserver;
