import React, { useState } from 'react';

import { format, isValid } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireItemInitial } from 'fhir/r4';
import { Controller, FieldError } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import DatePicker from '@helsenorge/datepicker/components/DatePicker';

import { safeParseJSON } from '../../../util/date-fns-utils';
import { getValidationTextExtension } from '../../../util/extension';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { formatDateToStringDDMMYYYY, parseStringToDateDDMMYYYY, validateDate, validateMaxDate, validateMinDate } from '@/util/date-utils';
import RenderHelpElement from '@/components/help-button/RenderHelpElement';

interface DateDayInputProps extends WithCommonFunctionsAndEnhancedProps, FormProps {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  resources?: Resources;
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: string;
  subLabel?: string;
  onDateValueChange: (newValue: string) => void;
  validationErrorRenderer?: JSX.Element;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
  answer: QuestionnaireResponseItemAnswer;
}

export const DateDayInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  item,
  resources,
  label,
  subLabel,
  onDateValueChange,
  maxDate,
  minDate,
  answer,
  error,
  children,
}: React.PropsWithChildren<DateDayInputProps>): JSX.Element => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const getDateAnswerValue = (answer: QuestionnaireResponseItemAnswer | QuestionnaireItemInitial): string | undefined => {
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  };

  const dateAnswerValue = getDateAnswerValue(answer);
  const parsedDateAnswerValue = parseStringToDateDDMMYYYY(dateAnswerValue);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(parsedDateAnswerValue);

  const getValue = (): (Date | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => safeParseJSON(String(getDateAnswerValue(m))));
    }

    if (Array.isArray(item.initial)) {
      return item.initial.map(m => safeParseJSON(String(getDateAnswerValue(m))));
    }

    if (answer) {
      const parsedDate = [safeParseJSON(String(getDateAnswerValue(answer)))];
      if (isValid(parsedDate[0]) === true) {
        return parsedDate;
      } else {
        return undefined;
      }
    }
  };

  const getPDFValue = (): string => {
    const date = getValue();
    const ikkeBesvartText = resources?.ikkeBesvart || '';

    return date ? date.map(d => d && format(d, 'd. MMMM yyyy')).join(', ') : ikkeBesvartText;
  };

  const handleChange = (newDate: string | Date | undefined): void => {
    if (typeof newDate !== 'string') {
      handleChangeDate(newDate);
    } else {
      handleChangeString(newDate);
    }
    if (defaultDate) {
      setDefaultDate(undefined);
    }
  };

  const handleChangeString = (value: string): void => {
    const valueAsDate = parseStringToDateDDMMYYYY(value);
    if (isValid(valueAsDate)) {
      onDateValueChange(value);
    } else {
      onDateValueChange('');
    }
    if (defaultDate) {
      setDefaultDate(undefined);
    }
  };

  const handleChangeDate = (value: Date | undefined): void => {
    if (isValid(value)) {
      const valueAsString = formatDateToStringDDMMYYYY(value);
      onDateValueChange(valueAsString);
    } else {
      onDateValueChange('');
    }
    if (defaultDate) {
      setDefaultDate(undefined);
    }
  };

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    const validationTextExtension = getValidationTextExtension(item);
    if (validationTextExtension) {
      return validationTextExtension;
    }
    if (error) {
      return error.message;
    }
  };

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue()}>
        {children}
      </TextView>
    );
  }

  return (
    <FormGroup error={getErrorText(error)}>
      <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
      <Controller
        name={idWithLinkIdAndItemIndex}
        shouldUnregister={true}
        rules={{
          required: {
            value: isRequired(item),
            message: resources?.formRequiredErrorMessage || '',
          },
          validate: {
            validDate: value => {
              return validateDate(parseStringToDateDDMMYYYY(value), resources);
            },
            validMinDate: value => {
              return validateMinDate(minDate, parseStringToDateDDMMYYYY(value), resources);
            },
            validMaxDate: value => {
              return validateMaxDate(maxDate, parseStringToDateDDMMYYYY(value), resources);
            },
          },
        }}
        render={({ field: { onChange } }): JSX.Element => (
          <DatePicker
            testId={getId(id)}
            autoComplete=""
            dateButtonAriaLabel="Open datepicker"
            dateFormat={'dd.MM.yyyy'}
            label={
              <Label
                labelId={`${getId(id)}-label`}
                labelTexts={[{ text: label || '' }]}
                sublabel={<Sublabel id={`${getId(id)}-sublabel`} sublabelTexts={[{ text: subLabel || '', type: 'normal' }]} />}
                afterLabelChildren={helpButton}
              />
            }
            minDate={minDate}
            maxDate={maxDate}
            onChange={(e, newDate) => {
              handleChange(newDate);
              onChange(newDate);
            }}
            dateValue={isValid(defaultDate) ? defaultDate : undefined}
          />
        )}
      />
    </FormGroup>
  );
};

// const getDatepickerErrorPhrases = (): DatePickerErrorPhrases => {
//   const { resources, item } = props;
//   // Vi får maks én valideringstekst, derfor settes alle til denne.
//   const validationErrorText = getValidationTextExtension(item);

//   return {
//     errorInvalidDate: validationErrorText ? validationErrorText : resources?.filterDateErrorDateFormat || '',
//     errorAfterMaxDate: resources?.errorAfterMaxDate || '',
//     errorBeforeMinDate: resources?.errorBeforeMinDate || '',
//     errorInvalidDateRange: '',
//     errorRequiredDate: resources?.dateRequired || '',
//     errorRequiredDateRange: '',
//     errorInvalidMinimumNights: '',
//   };
// }

// toLocaleDate(moment: Moment | undefined): Moment | undefined {
//   return moment ? moment.locale(getLocaleFromLanguage()) : undefined;
// }

// const isValidDate = (date: Date | undefined): boolean => {
//   if (date instanceof Date) {
//     const text = Date.prototype.toString.call(date);
//     return text !== 'Invalid Date';
//   }
//   return false;
// };

// const getSingleDateValue = (): Date | undefined => {
//   const date = getValue();
//   return date ? safeParseJSON(date[0]) : undefined;
// };
