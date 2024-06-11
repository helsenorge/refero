import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { format, setHours, setMinutes, startOfDay, isValid, isBefore, isAfter, endOfDay } from 'date-fns';
import { safeParseJSON } from './date-fns-utils';
import { DateFormat, DatePickerFormat, DateTimeUnit } from '../types/dateTypes';
import { mockMaxDateTime, mockMinDateTime } from '../components/formcomponents/date/date-mocks';
import { Resources } from './resources';

export function getFullFnsDate(date: Date | string | undefined, hours: string | undefined, minutes: string | undefined): Date | undefined {
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

  let fullDate = setHours(date, hoursNumber);
  fullDate = setMinutes(fullDate, minutesNumber);

  return fullDate;
}

export const getDateFromAnswer = (answer: QuestionnaireResponseItemAnswer): Date | string | undefined => {
  const dateObject = answer?.valueDateTime ? safeParseJSON(answer.valueDateTime) : null;

  if (dateObject) {
    return startOfDay(dateObject);
  }
};

export const getHoursOrMinutesFromAnswer = (answer: QuestionnaireResponseItemAnswer, unitToGet: DateTimeUnit) => {
  const dateObject = answer?.valueDateTime ? safeParseJSON(answer.valueDateTime) : null;

  if (dateObject && unitToGet === DateTimeUnit.Hours) {
    return format(dateObject, DatePickerFormat.HH);
  }
  if (dateObject && unitToGet === DateTimeUnit.Minutes) {
    return format(dateObject, DatePickerFormat.mm);
  }
};

export const validateDate = (dateToValidate: Date | undefined, resources: Resources | undefined) => {
  if (!isValid(dateToValidate)) {
    return resources?.dateError_invalid;
  }
  return true;
};

export const validateMinDate = (dateToValidate: Date | undefined, resources: Resources | undefined) => {
  if (mockMinDateTime && dateToValidate && isBefore(dateToValidate, startOfDay(mockMinDateTime))) {
    return `${resources?.errorBeforeMinDate} ${format(mockMinDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateMaxDate = (dateToValidate: Date | undefined, resources: Resources | undefined) => {
  if (mockMaxDateTime && dateToValidate && isAfter(dateToValidate, endOfDay(mockMaxDateTime))) {
    return `${resources?.errorAfterMaxDate} ${format(mockMaxDateTime, DateFormat.ddMMyyyy)}`;
  }
  return true;
};

export const validateTime = (dateToValidate: Date | undefined, resources: Resources | undefined) => {
  const hours = dateToValidate?.getHours();
  const minutes = dateToValidate?.getMinutes();

  if (hours && (hours < 0 || hours > 23)) {
    return resources?.dateError_time_invalid;
  }
  if (minutes && (minutes < 0 || minutes > 59)) {
    return resources?.dateError_time_invalid;
  }
  return true;
};
