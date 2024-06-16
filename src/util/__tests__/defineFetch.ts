Object.defineProperty(window, 'fetch', {
  value: jest.fn(() => {
    return Promise.resolve();
  }),
});
