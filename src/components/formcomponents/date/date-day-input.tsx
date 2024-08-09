import React, { useState } from 'react';

import { format, isValid } from 'date-fns';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
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
import { RenderItemProps } from '@/components/QuestionnaireItems';
import RenderHelpButton from '../help-button/RenderHelpButton';
import RenderHelpElement from '../help-button/RenderHelpElement';
import { useGetAnswer } from '@/hooks/useGetAnswer';

type DateDayInputProps = RenderItemProps & {
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: string;
  subLabel?: string;
  onDateValueChange: (newValue: string) => void;
  validationErrorRenderer?: JSX.Element;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
  children: React.ReactNode;
};

export const DateDayInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  item,
  resources,
  onDateValueChange,
  maxDate,
  minDate,
  children,
}: DateDayInputProps): JSX.Element | null => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const answer = useGetAnswer(item);

  const getDateAnswerValue = (
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined
  ): string | undefined => {
    const answerValue = Array.isArray(answer) ? answer[0] : answer;
    if (answerValue && answerValue.valueDate) {
      return answerValue.valueDate;
    }
    if (answerValue && answerValue.valueDateTime) {
      return answerValue.valueDateTime;
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDateTime) {
      return item.initial[0].valueDateTime;
    }
    return item.initial[0].valueDate;
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
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-datepicker`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
        afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
      />
      <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />

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
