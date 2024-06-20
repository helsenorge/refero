import { formatISO } from 'date-fns';

export const mockMinDateTime = formatISO(
  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
);
export const mockMaxDateTime = formatISO(
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
);