import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { format, setHours, setMinutes, startOfDay, isValid, isBefore, isAfter, endOfDay } from 'date-fns';
import { safeParseJSON } from './date-fns-utils';
import { DateFormat, DatePickerFormat, DateTimeUnit } from '../types/dateTypes';
import { mockMaxDateTime, mockMinDateTime } from '../components/formcomponents/date/date-mocks';
import { Resources } from './resources';

export function getFullFnsDate(date: Date | string | undefined, hours: string | undefined, minutes: string | undefined): Date | undefined {
  if (!date) {
    console.log('date er undefined');
  }
  if (!date || !hours || !minutes) {
    return undefined;
  }

  const hoursNumber = parseInt(hours, 10);
  const minutesNumber = parseInt(minutes, 10);

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

export const validateDateTime = (dateToValidate: Date | undefined, resources: Resources | undefined) => {
  if (!isValid(dateToValidate)) {
    return resources?.dateError_invalid;
  }

  if (mockMinDateTime && dateToValidate && isBefore(dateToValidate, startOfDay(mockMinDateTime))) {
    return `${resources?.errorBeforeMinDate} ${format(mockMinDateTime, DateFormat.ddMMyyyy)}`;
  }

  if (mockMaxDateTime && dateToValidate && isAfter(dateToValidate, endOfDay(mockMaxDateTime))) {
    return `${resources?.errorAfterMaxDate} ${format(mockMaxDateTime, DateFormat.ddMMyyyy)}`;
  }

  return true;
};
