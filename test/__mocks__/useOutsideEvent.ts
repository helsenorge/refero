import { vi } from 'vitest';

vi.mock('../hooks/useOutsideEvent', () => ({
  useOutsideEvent: vi.fn(),
}));

export {};
