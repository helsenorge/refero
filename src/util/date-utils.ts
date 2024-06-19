import { parse, format, setHours, setMinutes, startOfDay, isValid, isBefore, isAfter, endOfDay } from 'date-fns';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { DateFormat, DatePickerFormat, DateTimeUnit } from '../types/dateTypes';

import { safeParseJSON } from './date-fns-utils';
import { Resources } from './resources';
import { mockMaxDateTime, mockMinDateTime } from '../components/formcomponents/date/date-mocks';
import Constants from '../constants/index';

export function getFullFnsDate(
  date: Date | string | undefined,
  hours: string | undefined,
  minutes: string | undefined
): string | undefined {
  if (typeof date == 'string') {
    date = parseStringToDateDDMMYYYY(date);
  }

  if (!date) {
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
  if (!date) return undefined;

  if (unitToGet === DateTimeUnit.Hours) {
    return format(date, DatePickerFormat.HH);
  }
  if (unitToGet === DateTimeUnit.Minutes) {
    return format(date, DatePickerFormat.mm);
  }

  return undefined;
};

export const parseStringToDateDDMMYYYY = (stringToParse: string): Date => {
  return parse(stringToParse, 'dd.MM.yyyy', new Date());
};
export const formatDateToStringDDMMYYYY = (dateToFormat: Date): string => {
  return format(dateToFormat, 'dd.MM.yyyy');
};

export const validateDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  if (!isValid(dateToValidate)) {
    return resources?.dateError_invalid || '';
  }
  return true;
};

export const validateMinDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  if (mockMinDateTime && dateToValidate && isBefore(dateToValidate, startOfDay(mockMinDateTime))) {
    return `${resources?.errorBeforeMinDate} ${format(mockMinDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateMaxDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  if (mockMaxDateTime && dateToValidate && isAfter(dateToValidate, endOfDay(mockMaxDateTime))) {
    return `${resources?.errorAfterMaxDate} ${format(mockMaxDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateHours = (hours: number | undefined, resources: Resources | undefined): true | string => {
  if (hours && (hours < 0 || hours > 23)) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};

export const validateMinutes = (minutes: number | undefined, resources: Resources | undefined): true | string => {
  if (minutes && (minutes < 0 || minutes > 59)) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};
