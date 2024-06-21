import {
  setDefaultOptions,
  format as formatDF,
  isEqual as isEqualDF,
  isSameDay as isSameDayDF,
  parseJSON as parseJSONDF,
  isBefore as isBeforeDF,
  isAfter as isAfterDF,
  startOfDay as startOfDayDF,
  isSameMonth as isSameMonthDF,
  FormatOptions,
} from 'date-fns';
import { nb } from 'date-fns/locale';

import { capitalize as ucfirst } from './string-utils';

/**
 * Vanlige datoformater brukt på helsenorge.no
 *
 * Eksemplene viser formattert dato med norsk bokmål (nb) locale
 */
export enum DateFormat {
  /** 02:08 */
  Time = 'p',

  /** 09.02.2023 */
  ShortDate = 'P',

  /** 09.02.2023 02:08 */
  ShortDateTime = 'Pp',

  /** 9. feb. 2023 */
  MediumDate = 'PP',

  /** 9. feb. 2023 02:08 */
  MediumDateTime = 'PPp',

  /** 9. februar 2023  */
  LongDate = 'PPP',

  /** 9. februar 2023 kl. 02:08  */
  LongDateTime = 'PPPp',

  /** torsdag 9. februar 2023 kl. 02:08 */
  LongDateWeekdayTime = 'PPPPp',

  /** feb. 2023 */
  ShortMonthYear = 'MMM yyyy',

  /** februar 2023  */
  MonthYear = 'MMMM yyyy',
}

/**
 * Initialiserer date-fns med norsk bokmål locale
 */
export const initialize = (): void => setDefaultOptions({ locale: nb });

/**
 * Parser en dato-streng til en gyldig Date.
 *
 * @param date Dato som skal parses
 * @returns En gyldig Date, eller undefined hvis dato ikke kan parses
 */
export const safeParseJSON = (date?: Date | string | null): Date | undefined => {
  if (!date) {
    return;
  }

  if (date instanceof Date && isNaN(date.getTime())) {
    return;
  }

  if (date instanceof Date) {
    return date;
  }

  const _date = parseJSONDF(date);

  if (isNaN(_date.getTime())) {
    return;
  }

  return _date;
};

/**
 * Konverterer en Date til Central European Time (tidssonen i Norge).
 * Merk at datoer i JS ikke inneholder informasjon om tidssone.
 * Denne funksjonen endrer datoen slik at den vises som norsk tid selv
 * om brukerens datamaskin er stilt inn på en annen tidssone.
 *
 * @param date Dato som skal konverteres til CET
 * @returns Dato justert slik at den vises som norsk tid selv om brukerens
 * datamaskin er stilt inn på en annen tidssone.
 */
export const toCentralEuropeanTime = (date: Date): Date => {
  const cetDate = new Date(
    date.toLocaleString('en-US', {
      timeZone: 'CET',
    })
  );

  return isNaN(cetDate.getTime()) ? date : cetDate;
};

/**
 * Konverterer dato til CET og formatterer den
 *
 * @param date Dato
 * @param formatStr Format
 * @param options Innstillinger for formattering
 * @returns Formattert dato
 */
export const formatCET = (date: Date, formatStr: string, options?: FormatOptions): string =>
  formatDF(toCentralEuropeanTime(date), formatStr, options);

/**
 * Parser en dato med safeParseJSON og formatterer datoen dersom den er gyldig.
 * Dersom datoen ikke er gyldig, returneres tom streng.
 *
 * @param date Dato som skal parses
 * @param formatStr Datoformat
 * @returns Formattert dato, eller tom streng
 */
export const safeFormatCET = (date: Date | string | null | undefined, formatStr: DateFormat | string): string => {
  const _date = safeParseJSON(date);

  if (!_date) {
    return '';
  }

  return formatCET(_date, formatStr);
};

/**
 * Formatterer dato som:
 * 22. mai 2020 kl. 09:05
 *
 * @param a - Dato som skal formatteres
 */
export const longDateTime = (date: Date): string => formatDF(date, DateFormat.LongDateTime);

/**
 * Formatterer dato som:
 * 22. mai 2020 eller 22. mai 2020 kl. 09:05
 *
 * @param a - Dato som skal formatteres
 */
export const longDate = (date: Date): string => {
  const startOfDay = startOfDayDF(date);

  return isEqualDF(date, startOfDay) ? formatDF(date, DateFormat.LongDate) : formatDF(date, DateFormat.LongDateTime);
};

/**
 * Formatterer dato som:
 * fredag 22. mai 2020 kl. 09:05
 *
 * @param date Dato som skal formatteres
 */
export const longDateNumbersClock = (date: Date): string => formatDF(date, DateFormat.LongDateWeekdayTime);

/**
 * Formatterer dato som:
 * 22. mai 2020 09:05
 *
 * @param date Dato som skal formatteres
 */
export const mediumDate = (date: Date): string => formatDF(date, DateFormat.MediumDateTime);

/**
 * Formatterer dato som:
 * 22.05.2020 09:05
 *
 * @param date Dato som skal formatteres
 */
export const mediumDateNumbers = (date: Date): string => formatDF(date, DateFormat.ShortDateTime);

/**
 * Formatterer dato som:
 * 5. nov. 2020
 *
 * @param date Dato som skal formatteres
 */
export const shortDate = (date: Date): string => formatDF(date, DateFormat.MediumDate);

/**
 * Formatterer dato som:
 * 5. november 2020
 *
 * @param date Dato som skal formatteres
 */
export const shortDateFullMonth = (date: Date): string => formatDF(date, DateFormat.LongDate);

/**
 * Formatterer dato som:
 * 05.11.2020
 *
 * @param date Dato som skal formatteres
 */
export const shortDateNumbers = (date: Date): string => formatDF(date, DateFormat.ShortDate);

/**
 * Formatterer tidspunkt som tom streng hvis tiden er midnatt, eller som:
 * 09:08
 *
 * @param date Dato som skal sjekkes
 * @param prefix - Tekst før formattert dato
 */
export const timeOfDay = (start: Date, prefix = ''): string => {
  let value = '';
  const startOfDay = startOfDayDF(start);
  if (!isEqualDF(start, startOfDay)) {
    value = prefix + formatDF(start, DateFormat.Time);
  }
  return value;
};

/**
 * Formatterer dato som:
 * November 2020
 *
 * @param date Dato som skal formatteres
 */
export const monthYear = (date: Date): string => ucfirst(formatDF(date, DateFormat.MonthYear));

/**
 * Formatterer dato som:
 * Nov 2020
 *
 * @param date Dato som skal formatteres
 */
export const shortMonthYear = (date: Date): string => ucfirst(formatDF(date, DateFormat.ShortMonthYear).replace('.', ''));

/**
 * Formatterer to datoer som:
 * Mai 2020 – August 2020
 *
 * @param start Startdato
 * @param end Sluttdato
 */
export const monthRange = (start: Date, end: Date): string => {
  let range: string;
  if (isSameMonthDF(start, end)) {
    range = ucfirst(formatDF(start, DateFormat.MonthYear));
  } else {
    range =
      ucfirst(formatDF(start, DateFormat.MonthYear)) +
      String.fromCharCode(160) +
      String.fromCharCode(8211) +
      String.fromCharCode(160) +
      ucfirst(formatDF(end, DateFormat.MonthYear));
  }
  return range;
};

/**
 * Formatterer to datoer som:
 * 22. mai 2020, mellom kl. 08:32 og 12:54
 * Forutsetter at begge tidspunktene er på samme dag
 *
 * @param start Startdato
 * @param end Sluttdato
 * @param betweenText ", mellom kl. "
 * @param andText "og"
 */
export const timeRangeBetween = (start: Date, end: Date, between = ', mellom kl. ', andText = ' og '): string => {
  let range: string;

  if (isEqualDF(start, end)) {
    range = formatDF(start, DateFormat.LongDateTime);
  } else {
    range = formatDF(start, DateFormat.MediumDate) + between + formatDF(start, DateFormat.Time) + andText + formatDF(end, DateFormat.Time);
  }
  return range;
};

/**
 * Formatterer to datoer som:
 * 22. mai 2020 kl. 08:32 - 12:54
 * Forutsetter at begge tidspunktene er på samme dag
 *
 * @param start Startdato
 * @param end Sluttdato
 */
export const timeRange = (start: Date, end: Date): string => {
  let range: string;

  if (isEqualDF(start, end)) {
    range = formatDF(start, DateFormat.LongDateTime);
  } else {
    range = formatDF(start, DateFormat.LongDateTime) + ' - ' + formatDF(end, DateFormat.Time);
  }
  return range;
};

/**
 * Formatterer to datoer som:
 * Fredag 22. mai 2020 kl. 08:32 - 12:54
 * Forutsetter at begge tidspunktene er på samme dag
 *
 * @param start Startdato
 * @param end Sluttdato
 */
export const longTimeRange = (start: Date, end?: Date): string => {
  let range = formatDF(start, DateFormat.LongDateWeekdayTime);

  if (end) {
    range = range + ' - ' + formatDF(end, DateFormat.Time);
  }

  return ucfirst(range);
};

/**
 * Returnerer true hvis dato a er før dato b
 * @param a Dato som skal sammenlignes
 * @param b Dato som skal sammenlignes
 */
export const isBeforeDay = (a: Date, b: Date): boolean => isBeforeDF(a.setHours(0, 0, 0, 0), b.setHours(0, 0, 0, 0));

/**
 * Returnerer true hvis dato a er etter dato b
 * @param a Dato som skal sammenlignes
 * @param b Dato som skal sammenlignes
 */
export const isAfterDay = (a: Date, b: Date): boolean => isAfterDF(a.setHours(0, 0, 0, 0), b.setHours(0, 0, 0, 0));

/**
 * Returnerer true hvis dato a er på samme dag eller etter dato b
 * @param a Dato som skal sammenlignes
 * @param b Dato som skal sammenlignes
 */
export const isInclusivelyAfterDay = (a: Date, b: Date): boolean => isSameDayDF(a, b) || isAfterDay(a, b);

/**
 * Returnerer true hvis input (inkludert minutter) er etter nåtid
 * @param date Dato som skal sammenlignes
 */
export const isAfter = (date: Date): boolean => isAfterDF(date, new Date());

/**
 * Returnerer true hvis input er etter dagens dato
 * Forskjell med 'isAfter' er at denne tar utgangspunkt i dager
 * @param date Dato som skal sammenlignes
 */
export const isAfterToday = (date: Date): boolean => isAfterDF(date.setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0));

/**
 * Sammenligner to datoer og returnerer true hvis den første datoen er etter den andre (fungerer også med tid)
 * @param a - Date
 * @param max - maksimum dato grense
 */
export const isAfterMaxDate = (a: Date, b: Date | undefined): boolean => !!b && isAfterDF(a, b);

/**
 * Returnerer true hvis dato a er på samme dag eller før dato b
 * @param a Dato som skal sammenlignes
 * @param b Dato som skal sammenlignes
 */
export const isInclusivelyBeforeDay = (a: Date, b: Date): boolean => isSameDayDF(a, b) || isBeforeDay(a, b);

/**
 * Returnerer true hvis input  (inkludert minutter) er før nåtid
 * @param date Dato som skal sammenlignes
 */
export const isBefore = (date: Date): boolean => isBeforeDF(date, new Date());

/**
 * Returnerer true hvis input er før dagens dato
 * Forskjell med 'isBefore' er at denne tar utgangspunkt i dager
 * @param date Dato som skal sammenlignes
 */
export const isBeforeToday = (date: Date): boolean => isBeforeDF(date.setHours(0, 0, 0, 0), new Date().setHours(0, 0, 0, 0));

/**
 * Sammenligner to datoer og returnerer true hvis den første datoen er før den andre (fungerer også med tid)
 * @param date - Date
 * @param min - minimum dato grense
 */
export const isBeforeMinDate = (a: Date, b: Date | undefined): boolean => !!b && isBeforeDF(a, b);

/**
 * Returnerer true hvis input er dagens dato og tid er tidligere enn nåtid
 * @param date Dato som skal sammenlignes
 */
export const isEarlierToday = (date: Date): boolean => {
  const now = new Date();

  return isSameDayDF(date, now) && isBeforeDF(date, now);
};

/**
 * Returnerer true hvis input er lik 0001-01-01T00:00:00
 * @param date Dato som skal sammenlignes
 */
export const isDotNetMinDate = (date: Date): boolean => isEqualDF(date, new Date('0001-01-01T00:00:00'));
