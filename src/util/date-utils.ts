import {
  format,
  formatISO,
  setHours,
  setMinutes,
  getYear,
  startOfDay,
  isValid,
  isBefore,
  isAfter,
  endOfDay,
  parseISO,
  parse,
} from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { DateFormat, DatePickerFormat, DateTimeUnit, TimeValues } from '../types/dateTypes';

import { safeParseJSON } from './date-fns-utils';
import { Resources } from './resources';

import '@helsenorge/datepicker/components/DatePicker/';
import { getExtension } from './extension';
import { Extensions } from '@/constants/extensions';

export function getFullFnsDate(
  date: Date | string | undefined,
  hours: string | undefined,
  minutes: string | undefined
): string | undefined {
  let newDate: Date | undefined = undefined;
  if (date === undefined) {
    const now = new Date();
    let onlyTime: string | undefined = undefined;
    if (hours !== undefined && hours !== '00') {
      onlyTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours.padStart(2, '0'), 10)).toISOString();
    }
    if (minutes !== undefined && minutes !== '00') {
      onlyTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        onlyTime ? new Date(onlyTime).getHours() : now.getHours(),
        parseInt(minutes.padStart(2, '0'), 10)
      ).toISOString();
    }
    if (onlyTime) return onlyTime;
  }
  if (typeof date === 'string') {
    newDate = parseISO(date);
  } else {
    newDate = date;
  }
  if (!newDate || !isValid(newDate)) {
    return undefined;
  } else {
    if (hours) {
      const hoursNumber = parseInt(hours.padStart(2, '0'), 10);
      newDate = setHours(newDate, hoursNumber);
    }
    if (minutes) {
      const minutesNumber = parseInt(minutes.padStart(2, '0'), 10);
      newDate = setMinutes(newDate, minutesNumber);
    }
  }

  return formatISO(newDate);
}

export const getDateFromAnswer = (answer: QuestionnaireResponseItemAnswer): Date | string | undefined => {
  const dateObject = answer?.valueDateTime ? safeParseJSON(answer.valueDateTime) : null;

  if (dateObject) {
    return startOfDay(dateObject);
  }
};

export const getHoursOrMinutesFromDate = (date: Date | undefined, unitToGet: DateTimeUnit): string | undefined => {
  if (!date || !isValid(date)) return undefined;

  if (unitToGet === DateTimeUnit.Hours) {
    return format(date, DatePickerFormat.HH);
  }
  if (unitToGet === DateTimeUnit.Minutes) {
    return format(date, DatePickerFormat.mm);
  }

  return undefined;
};

const getHoursAndMinutesFromTime = (timeString: string): TimeValues => {
  const [hours, minutes] = timeString.split(':').map(String);
  return {
    hours: !hours ? '00' : hours,
    minutes: !minutes ? '00' : minutes,
  };
};

const extractTimeFromAnswer = (answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): string | undefined => {
  if (Array.isArray(answer) && answer.length > 0) {
    return answer[0].valueTime || answer[0].valueDate || answer[0].valueDateTime;
  } else if (answer && !Array.isArray(answer)) {
    return answer.valueTime || answer.valueDate || answer.valueDateTime;
  }
};
//slå sammen funksjoner?
//answer parameter/inital parameter
//linje 101+103 slå sammen

export const extractHoursAndMinutesFromAnswer = (
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined,
  item?: QuestionnaireItem
): TimeValues | null => {
  const timeString = extractTimeFromAnswer(answer) || extractTimeFromAnswer(item?.initial);
  return timeString ? getHoursAndMinutesFromTime(timeString) : null;
};

export const isValueFormatYYYYMMDD = (value: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const isValueFormatDDMMYYYY = (value: string): boolean => {
  return /^\d{2}\.\d{2}\.\d{4}$/.test(value);
};

export const isValueFormatISO = (value: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:\+|-)\d{2}:\d{2})$/.test(value);
};

export const parseStringToDate = (valueToParse: string | undefined): Date | undefined => {
  if (typeof valueToParse === 'string') {
    if (valueToParse && isValueFormatYYYYMMDD(valueToParse)) {
      const test = parse(valueToParse, 'yyyy-MM-dd', new Date());
      return test;
    } else if (valueToParse && isValueFormatDDMMYYYY(valueToParse)) {
      const test = parse(valueToParse, 'dd.MM.yyyy', new Date());
      return test;
    } else if (valueToParse && isValueFormatISO(valueToParse)) {
      const parsedDate = parseISO(valueToParse);
      return parsedDate;
    }
  }
};

export const formatDateToString = (dateToFormat: Date | undefined): string => {
  const formattedDate = dateToFormat ? formatISO(dateToFormat) : '';
  return formattedDate;
};

export const getMonthOptions = (
  resources: Resources | undefined
): {
  optionName: string | undefined;
  optionValue: string;
}[] => {
  return [
    {
      optionName: resources?.yearmonth_field_month_placeholder,
      optionValue: '',
    },
    {
      optionName: resources?.dateLabel_january,
      optionValue: '01',
    },
    {
      optionName: resources?.dateLabel_february,
      optionValue: '02',
    },
    {
      optionName: resources?.dateLabel_march,
      optionValue: '03',
    },
    {
      optionName: resources?.dateLabel_april,
      optionValue: '04',
    },
    {
      optionName: resources?.dateLabel_may,
      optionValue: '05',
    },
    {
      optionName: resources?.dateLabel_june,
      optionValue: '06',
    },
    {
      optionName: resources?.dateLabel_july,
      optionValue: '07',
    },
    {
      optionName: resources?.dateLabel_august,
      optionValue: '08',
    },
    {
      optionName: resources?.dateLabel_september,
      optionValue: '09',
    },
    {
      optionName: resources?.dateLabel_october,
      optionValue: '10',
    },
    {
      optionName: resources?.dateLabel_november,
      optionValue: '11',
    },
    {
      optionName: resources?.dateLabel_december,
      optionValue: '12',
    },
  ];
};

export const getYearFromString = (dateString: string): string => {
  return dateString ? dateString.split('-')[0] : '';
};

const parseTimestringToDate = (timeToParse?: string): Date | undefined => {
  const dateToReturn = new Date();

  if (timeToParse) {
    const [hours, minutes] = timeToParse.split(':').map(Number);
    dateToReturn.setHours(hours, minutes);
    return dateToReturn;
  }
};

const parseHoursAndMinutesToDate = (hours?: string, minutes?: string): Date | undefined => {
  const dateToReturn = new Date();
  const timeToParse = `${hours}:${minutes}:00`;

  if (hours && minutes) {
    const [hours, minutes] = timeToParse.split(':').map(Number);
    dateToReturn.setHours(hours, minutes);
    return dateToReturn;
  }
};

const getMinTime = (item?: QuestionnaireItem): string | undefined => {
  const minTime = getExtension(Extensions.MIN_VALUE_URL, item);
  if (!minTime || !minTime.valueTime) {
    return;
  }
  return minTime.valueTime;
};

const getMaxTime = (item?: QuestionnaireItem): string | undefined => {
  const maxTime = getExtension(Extensions.MAX_VALUE_URL, item);
  if (!maxTime || !maxTime.valueTime) {
    return;
  }
  return maxTime.valueTime;
};

export const validateDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  if (!dateToValidate || !isValid(dateToValidate)) {
    return resources?.dateError_invalid || '';
  }
  return true;
};

export const validateMinDate = (
  minDateTime: Date | undefined,
  dateToValidate: Date | undefined,
  resources: Resources | undefined
): true | string => {
  if (minDateTime && dateToValidate && isBefore(dateToValidate, startOfDay(minDateTime))) {
    return `${resources?.errorBeforeMinDate}: ${format(minDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateMaxDate = (
  maxDateTime: Date | undefined,
  dateToValidate: Date | undefined,
  resources: Resources | undefined
): true | string => {
  if (maxDateTime && dateToValidate && isAfter(dateToValidate, endOfDay(maxDateTime))) {
    return `${resources?.errorAfterMaxDate}: ${format(maxDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateHours = (hours: number | undefined, resources: Resources | undefined): true | string => {
  if (!hours || (hours && (hours < 0 || hours >= 24))) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};

export const validateMinutes = (minutes: number | undefined, resources: Resources | undefined): true | string => {
  if (!minutes || (minutes && (minutes < 0 || minutes >= 60))) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};

export const validateMinTime = (
  hours: string | undefined,
  minutes: string | undefined,
  resources: Resources | undefined,
  item?: QuestionnaireItem
): true | string => {
  const minTime = parseTimestringToDate(getMinTime(item));
  const timeToValidate = parseHoursAndMinutesToDate(hours, minutes);

  if (minTime && timeToValidate && timeToValidate < minTime) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};
//hvis mintime/maxtime er undefined, returner true
export const validateMaxTime = (
  hours: string | undefined,
  minutes: string | undefined,
  resources: Resources | undefined,
  item?: QuestionnaireItem
): true | string => {
  const maxTime = parseTimestringToDate(getMaxTime(item));
  const timeToValidate = parseHoursAndMinutesToDate(hours, minutes);
  if (timeToValidate && maxTime && timeToValidate > maxTime) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};

export const validateYearDigits = (year: number | string, resources: Resources | undefined): true | string => {
  if (year && year.toString().length !== 4) {
    return resources?.year_field_invalid || '';
  }

  return true;
};

export const validateYearMin = (minDate: Date | undefined, yearToValidate: number, resources: Resources | undefined): true | string => {
  if (minDate) {
    const minYear = getYear(minDate);
    if (minYear > yearToValidate) {
      return `${resources?.year_field_mindate}: ${minYear}`;
    }
  }
  return true;
};

export const validateYearMax = (maxDate: Date | undefined, yearToValidate: number, resources: Resources | undefined): true | string => {
  if (maxDate) {
    const maxYear = getYear(maxDate);
    if (maxYear < yearToValidate) {
      return `${resources?.year_field_maxdate}: ${maxYear}`;
    }
  }
  return true;
};

export const validateYearMonthMin = (
  minDate: Date | undefined,
  yearToValidate: string,
  monthToValidate: string,
  resources: Resources | undefined
): true | string => {
  if (minDate) {
    const yearMonthToValidate = `${yearToValidate}-${monthToValidate}`;
    const dateToValidate = parse(yearMonthToValidate, DateFormat.yyyyMM, new Date());
    if (dateToValidate < minDate) {
      return `${resources?.errorBeforeMinDate}: ${format(minDate, DateFormat.MMMMyyyy)}`;
    }
  }
  return true;
};

export const validateYearMonthMax = (
  maxDate: Date | undefined,
  yearToValidate: string,
  monthToValidate: string,
  resources: Resources | undefined
): true | string => {
  if (maxDate) {
    const yearMonthToValidate = `${yearToValidate}-${monthToValidate}`;
    const dateToValidate = parse(yearMonthToValidate, DateFormat.yyyyMM, new Date());
    if (dateToValidate > maxDate) {
      return `${resources?.errorAfterMaxDate}: ${format(maxDate, DateFormat.MMMMyyyy)}`;
    }
  }
  return true;
};
