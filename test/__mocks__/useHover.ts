import { vi as jest } from 'vitest';

vi.mock('../hooks/useHover', () => ({
  useHover: vi.fn().mockImplementation(ref => {
    return { hoverRef: ref || { current: undefined }, isHovered: false };
  }),
}));

export {};
