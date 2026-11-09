import { DateFormat } from '../../types/dateTypes';
import { getPDFValueForDate } from '../date-utils';

describe('getPDFValueForDate', () => {
  it('formats day with Norwegian month names for nb-NO', () => {
    expect(getPDFValueForDate('2026-03-18', undefined, DateFormat.yyyyMMdd, DateFormat.dMMyyyy, 'nb-NO')).toBe('18. mars 2026');
  });

  it('formats day with English month names for en-GB', () => {
    expect(getPDFValueForDate('2026-03-18', undefined, DateFormat.yyyyMMdd, DateFormat.dMMyyyy, 'en-GB')).toBe('18. March 2026');
  });

  it('formats month with English month names for en-GB', () => {
    expect(getPDFValueForDate('2026-03', undefined, DateFormat.yyyyMM, DateFormat.MMMMyyyy, 'en-GB')).toBe('March 2026');
  });

  it('formats array values with the given language', () => {
    expect(getPDFValueForDate(['2026-03-18', '2026-05-01'], undefined, DateFormat.yyyyMMdd, DateFormat.dMMyyyy, 'en-GB')).toBe(
      '18. March 2026, 1. May 2026'
    );
  });
});
