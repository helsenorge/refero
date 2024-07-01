import React from 'react';

import { format } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireItemInitial } from 'fhir/r4';
import { Controller, FieldError } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
// import { DateRangePicker } from '@helsenorge/date-time/components/date-range-picker';
// import { DatePickerErrorPhrases } from '@helsenorge/date-time/components/date-range-picker/date-range-picker-types';

import DatePicker from '@helsenorge/datepicker/components/DatePicker';

import { safeParseJSON } from '../../../util/date-fns-utils';
import { getValidationTextExtension } from '../../../util/extension';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { parseStringToDateDDMMYYYY, validateDate, validateMaxDate, validateMinDate } from '@/util/date-utils';

interface DateDayInputProps extends WithCommonFunctionsAndEnhancedProps, FormProps {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  resources?: Resources;
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: string;
  subLabel?: string;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
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
  locale,
  label,
  subLabel,
  helpButton,
  helpElement,
  onDateValueChange,
  onRenderMarkdown,
  validationErrorRenderer,
  className,
  maxDate,
  minDate,
  answer,
  error,
  children,
}: React.PropsWithChildren<DateDayInputProps>): JSX.Element => {
  const getDateAnswerValue = (answer: QuestionnaireResponseItemAnswer | QuestionnaireItemInitial): string | undefined => {
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  };

  const getValue = (): (Date | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => safeParseJSON(String(getDateAnswerValue(m))));
    }

    if (Array.isArray(item.initial)) {
      return item.initial.map(m => safeParseJSON(String(getDateAnswerValue(m))));
    }

    if (answer) {
      const parsedDate = [safeParseJSON(String(getDateAnswerValue(answer)))];
      if (isValidDate(parsedDate[0]) === true) {
        return parsedDate;
      } else {
        return undefined;
      }
    }
  };

  const isValidDate = (date: Date | undefined): boolean => {
    if (date instanceof Date) {
      const text = Date.prototype.toString.call(date);
      return text !== 'Invalid Date';
    }
    return false;
  };

  const handleDateChange = (value: string | Date | undefined): void => {
    const newValue = value ? format(value, 'dd.MM.yyyy') : '';
    onDateValueChange(newValue);
  };

  const getPDFValue = (): string => {
    const date = getValue();
    const ikkeBesvartText = resources?.ikkeBesvart || '';

    return date ? date.map(d => d && format(d, 'd. MMMM yyyy')).join(', ') : ikkeBesvartText;
  };

  const getSingleDateValue = (): Date | undefined => {
    const date = getValue();
    return date ? safeParseJSON(date[0]) : undefined;
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
      <TextView
        id={id}
        item={item}
        value={getPDFValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={helpButton}
        helpElement={helpElement}
      >
        {children}
      </TextView>
    );
  }

  return (
    <FormGroup error={getErrorText(error)}>
      {helpElement}
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
              console.log(value);
              return validateDate(parseStringToDateDDMMYYYY(value), resources);
            },
            validMinDate: value => {
              console.log(value);
              return validateMinDate(minDate, parseStringToDateDDMMYYYY(value), resources);
            },
            validMaxDate: value => {
              console.log(value);
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
              handleDateChange(newDate);
              onChange(newDate);
            }}
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
