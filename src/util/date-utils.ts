import { parse, format, setHours, setMinutes, getYear, startOfDay, isValid, isBefore, isAfter, endOfDay, parseISO } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { DateFormat, DatePickerFormat, DateTimeUnit, TimeValues } from '../types/dateTypes';

import { safeParseJSON } from './date-fns-utils';
import { Resources } from './resources';
import Constants from '../constants/index';

import '@helsenorge/datepicker/components/DatePicker/';
import { getExtension } from './extension';
import { Extensions } from '@/constants/extensions';
import * as DateTimeConstants from '../constants/dateTimeConstants';

export function getFullFnsDate(
  date: Date | string | undefined,
  hours: string | undefined,
  minutes: string | undefined
): string | undefined {
  if (typeof date == 'string') {
    date = parseStringToDateDDMMYYYY(date);
  }

  if (!date || !isValid(date)) {
    return undefined;
  } else {
    if (hours) {
      const hoursNumber = parseInt(hours, 10);
      date = setHours(date, hoursNumber);
    }
    if (minutes) {
      const minutesNumber = parseInt(minutes, 10);
      date = setMinutes(date, minutesNumber);
    }
  }

  return format(date, Constants.DATE_TIME_FORMAT);
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

export const extractTimeFromAnswer = (
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined
): TimeValues | null => {
  if (!answer) return null;

  const getTimeValues = (timeStr: string): TimeValues => {
    const date = parseISO(timeStr);
    return {
      hours: date.getHours(),
      minutes: date.getMinutes(),
    };
  };

  let timeStr: string | undefined;

  if (Array.isArray(answer)) {
    if (answer.length > 0) {
      timeStr = answer[0].valueTime || answer[0].valueDate || answer[0].valueDateTime;
    }
  } else {
    timeStr = answer.valueTime || answer.valueDate || answer.valueDateTime;
  }

  if (timeStr) {
    return getTimeValues(timeStr);
  }

  return null;
};

export const parseStringToDateDDMMYYYY = (valueToParse: string | Date | undefined): Date | undefined => {
  if (valueToParse) {
    if (typeof valueToParse == 'string') {
      return parse(valueToParse, 'dd.MM.yyyy', new Date());
    } else {
      return valueToParse;
    }
  }
};
export const formatDateToStringDDMMYYYY = (dateToFormat: Date | undefined): string => {
  return format(dateToFormat || '', 'dd.MM.yyyy');
};

export const getMonthOptions = (resources: Resources | undefined) => {
  return [
    {
      optionName: '',
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

const getMaxHour = (item: QuestionnaireItem): number => {
  const maxTime = getExtension(Extensions.MAX_VALUE_URL, item);
  if (!maxTime || !maxTime.valueTime) {
    return 23;
  }
  const maxTimeString = maxTime.valueTime;
  const hoursString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
  return parseInt(hoursString, 10);
};

const getMaxMinute = (item: QuestionnaireItem): number => {
  const maxTime = getExtension(Extensions.MAX_VALUE_URL, item);
  if (!maxTime || !maxTime.valueTime) {
    return 59;
  }
  const maxTimeString = maxTime.valueTime;
  const minuteString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
  return parseInt(minuteString, 10);
};

const getMinHour = (item: QuestionnaireItem): number => {
  const minTime = getExtension(Extensions.MIN_VALUE_URL, item);
  if (!minTime || !minTime.valueTime) {
    return 0;
  }
  const minTimeString = minTime.valueTime;
  const hoursString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
  return parseInt(hoursString, 10);
};

const getMinMinute = (item: QuestionnaireItem): number => {
  const minTime = getExtension(Extensions.MIN_VALUE_URL, item);
  if (!minTime || !minTime.valueTime) {
    return 0;
  }
  const minTimeString = minTime.valueTime;
  const minuteString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
  return parseInt(minuteString, 10);
};

export const validateDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  if (!isValid(dateToValidate)) {
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

export const validateHours = (hours: number | undefined, resources: Resources | undefined, item: QuestionnaireItem): true | string => {
  const minHours = getMinHour(item);
  const maxHours = getMaxHour(item);
  if (hours && (hours < minHours || hours > maxHours)) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};

export const validateMinutes = (minutes: number | undefined, resources: Resources | undefined, item: QuestionnaireItem): true | string => {
  const minMinutes = getMinMinute(item);
  const maxMinutes = getMaxMinute(item);
  if (minutes && (minutes < minMinutes || minutes > maxMinutes)) {
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
