import { vi } from 'vitest';

vi.mock('../hooks/useLayoutEvent', () => ({
  useLayoutEvent: vi.fn(),
}));

export {};
