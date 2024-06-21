import { vi as jest } from 'vitest';

jest.mock('../hooks/useLayoutEvent', () => ({
  useLayoutEvent: jest.fn(),
}));

export {};
