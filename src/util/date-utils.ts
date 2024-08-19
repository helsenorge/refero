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
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { DateFormat, DatePickerFormat, DateTimeUnit } from '../types/dateTypes';

import { safeParseJSON } from './date-fns-utils';
import { Resources } from './resources';

import '@helsenorge/datepicker/components/DatePicker/';

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

export const parseStringToDateDDMMYYYY = (valueToParse: string | Date | undefined): Date | undefined => {
  if (valueToParse) {
    if (typeof valueToParse === 'string') {
      const isoParsed = parseISO(valueToParse);
      return isValid(isoParsed) ? isoParsed : parse(valueToParse, DateFormat.ddMMyyyy, new Date());
    } else {
      return valueToParse;
    }
  }
};
export const formatDateToStringDDMMYYYY = (dateToFormat: Date | undefined): string => {
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

export const validateDate = (dateToValidate: Date | undefined, resources: Resources | undefined): true | string => {
  if (dateToValidate && !isValid(dateToValidate)) {
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
