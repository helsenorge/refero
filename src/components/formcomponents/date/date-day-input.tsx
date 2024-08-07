import React, { useState } from 'react';

import { format, isValid } from 'date-fns';
import { QuestionnaireResponseItemAnswer, QuestionnaireItemInitial } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import DatePicker from '@helsenorge/datepicker/components/DatePicker';

import { safeParseJSON } from '../../../util/date-fns-utils';
import { getValidationTextExtension } from '../../../util/extension';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { formatDateToStringDDMMYYYY, parseStringToDateDDMMYYYY, validateDate, validateMaxDate, validateMinDate } from '@/util/date-utils';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import { RenderItemProps } from '../renderChildren/RenderChildrenItems';

type DateDayInputProps = RenderItemProps & {
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: string;
  subLabel?: string;
  onDateValueChange: (newValue: string) => void;
  validationErrorRenderer?: JSX.Element;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
  answer: QuestionnaireResponseItemAnswer;
  children: React.ReactNode;
};

export const DateDayInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  item,
  resources,
  questionnaire,
  helpButton,
  helpElement,
  onDateValueChange,
  onRenderMarkdown,
  renderHelpButton,
  maxDate,
  minDate,
  answer,
  children,
}: DateDayInputProps): JSX.Element => {
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
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
      {helpElement}
      <ReferoLabel
        item={item}
        onRenderMarkdown={onRenderMarkdown}
        questionnaire={questionnaire}
        resources={resources}
        htmlFor={`${getId(id)}-datepicker`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
        renderHelpButton={renderHelpButton}
      />
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
            inputId={`${getId(id)}-datepicker`}
            testId={`${getId(id)}-datepicker-test`}
            autoComplete=""
            dateButtonAriaLabel="Open datepicker"
            dateFormat={'dd.MM.yyyy'}
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
