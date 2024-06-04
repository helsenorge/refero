import { setHours, setMinutes } from 'date-fns';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { format, startOfDay } from 'date-fns';
import { safeParseJSON } from './date-fns-utils';
import { DatePickerFormat, DateTimeUnit } from '../types/dateTypes';

export function getFullFnsDate(date: Date | undefined, hours: string | undefined, minutes: string | undefined): Date | undefined {
  if (!date || !hours || !minutes) {
    return undefined;
  }

  const hoursNumber = parseInt(hours, 10);
  const minutesNumber = parseInt(minutes, 10);

  if (isNaN(hoursNumber) || hoursNumber < 0 || hoursNumber > 23) {
    throw new Error('Invalid hours value');
  }
  if (isNaN(minutesNumber) || minutesNumber < 0 || minutesNumber > 59) {
    throw new Error('Invalid minutes value');
  }

  let fullDate = setHours(date, hoursNumber);
  fullDate = setMinutes(fullDate, minutesNumber);

  return fullDate;
}

export const getDateFromAnswer = (answer: QuestionnaireResponseItemAnswer) => {
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
