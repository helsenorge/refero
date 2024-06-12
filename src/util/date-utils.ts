import { parse, format, setHours, setMinutes, startOfDay, isValid, isBefore, isAfter, endOfDay } from 'date-fns';
import { nb } from 'date-fns/locale';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { DateFormat, DatePickerFormat, DateTimeUnit } from '../types/dateTypes';

import { safeParseJSON } from './date-fns-utils';
import { Resources } from './resources';
import { mockMaxDateTime, mockMinDateTime } from '../components/formcomponents/date/date-mocks';
import Constants from '../constants/index';

export function getFullFnsDate(date: Date | string | undefined, hours: string | undefined, minutes: string | undefined): Date | undefined {
  console.log(date);

  if (!date || !hours || !minutes) {
    return undefined;
  }

  const hoursNumber = parseInt(hours, 10);
  const minutesNumber = parseInt(minutes, 10);

  if (hoursNumber < 0 || hoursNumber > 23) {
    return new Date('');
  }

  if (minutesNumber < 0 || minutesNumber > 59) {
    return new Date('');
  }

  let fullDate: Date;

  // Pass på at strengen blir parset med format og locale
  if (typeof date === 'string') {
    fullDate = parse(date, 'dd.MM.yyyy', new Date(), { 
      locale: nb // Dette passer på at parsing blir gjort i forhold til norsk bokmål
    });

    if (isNaN(fullDate.getTime())) { // Sjekk for en gyldig dato rett etter parsing
      console.error('The provided date string could not be parsed into a valid date:', date);
      return undefined;
    }
  } else {
    fullDate = date;
  }

  fullDate = setHours(date, hoursNumber);
  fullDate = setMinutes(fullDate, minutesNumber);

  console.log(fullDate);

  return fullDate;
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

export const validateDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  const fullDate = getFullFnsDate(dateToValidate, '05', '05');
  if (!isValid(fullDate)) {
    return resources?.dateError_invalid || '';
  }
  return true;
};

export const validateMinDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  const fullDate = getFullFnsDate(dateToValidate, '05', '05');
  if (mockMinDateTime && fullDate && isBefore(fullDate, startOfDay(mockMinDateTime))) {
    return `${resources?.errorBeforeMinDate} ${format(mockMinDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateMaxDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  const fullDate = getFullFnsDate(dateToValidate, '05', '05');
  if (mockMaxDateTime && fullDate && isAfter(fullDate, endOfDay(mockMaxDateTime))) {
    return `${resources?.errorAfterMaxDate} ${format(mockMaxDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateHours = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  const hours = dateToValidate?.getHours();
  if (hours && (hours < 0 || hours > 23)) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};

export const validateMinutes = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  const minutes = dateToValidate?.getMinutes();
  if (minutes && (minutes < 0 || minutes > 59)) {
    return resources?.dateError_time_invalid || '';
  }
  return true;
};
