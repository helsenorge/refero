import { vi } from 'vitest';

vi.mock('../hooks/useSize', () => ({
  useSize: vi.fn().mockReturnValue({
    height: 100,
    width: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
  }),
}));

export {};
