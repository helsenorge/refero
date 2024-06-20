import { vi as jest } from 'vitest';

jest.mock('../hooks/useOutsideEvent', () => ({
  useOutsideEvent: jest.fn(),
}));

export {};
