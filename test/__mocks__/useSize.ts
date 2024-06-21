import { vi as jest } from 'vitest';

jest.mock('../hooks/useSize', () => ({
  useSize: jest.fn().mockReturnValue({
    height: 100,
    width: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
  }),
}));

export {};
