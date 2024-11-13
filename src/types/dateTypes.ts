import { parseISO } from 'date-fns';

export enum DateTimeUnit {
  Date = 'date',
  Hours = 'hours',
  Minutes = 'minutes',
}

export enum TimeUnit {
  Hours = 'hours',
  Minutes = 'minutes',
}

export enum DatePickerFormat {
  HH = 'HH',
  mm = 'mm',
}

export enum DateFormat {
  ddMMyyyy = 'dd.MM.yyyy',
  dMMyyyy = 'd. MMMM yyyy',
  yyyyMMdd = 'yyyy-MM-dd',
  yyyyMM = 'yyyy-MM',
  MMMMyyyy = 'MMMM yyyy',
  ddMMyyyyHHmm = 'dd.MM.yyyy HH:mm',
  yyyyMMddHHmmssXXX = "yyyy-MM-dd'T'HH:mm:ssXXX",
}

export interface TimeValues {
  hours: string;
  minutes: string;
}

export const defaultMinDate = parseISO('1800-01-01');
export const defaultMaxDate = parseISO('2200-12-31');
