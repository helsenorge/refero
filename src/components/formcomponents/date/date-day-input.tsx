import { useState } from 'react';

import { format, isValid } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import DatePicker from '@helsenorge/datepicker/components/DatePicker';

import { getValidationTextExtension } from '../../../util/extension';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import {
  formatDateToString,
  isValueFormatDDMMYYYY,
  parseStringToDate,
  validateDate,
  validateMaxDate,
  validateMinDate,
} from '@/util/date-utils';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import RenderHelpButton from '../help-button/RenderHelpButton';
import RenderHelpElement from '../help-button/RenderHelpElement';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useMinMaxDate } from './useMinMaxDate';
import { initialize } from '@/util/date-fns-utils';
import { GlobalState } from '@/reducers';
import { useSelector } from 'react-redux';
import { findQuestionnaireItem } from '@/reducers/selectors';

type DateDayInputProps = QuestionnaireComponentItemProps & {
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  onDateValueChange: (newValue: string) => void;
};

export const DateDayInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  linkId,
  onDateValueChange,
  children,
  path,
}: DateDayInputProps): JSX.Element | null => {
  initialize();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const answer = useGetAnswer(linkId, path);
  const { minDateTime, maxDateTime } = useMinMaxDate(item);
  const { resources } = useExternalRenderContext();

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
  const date = parseStringToDate(dateAnswerValue);

  const getValue = (
    item?: QuestionnaireItem,
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): string | string[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueDate).filter(f => f !== undefined);
    }
    if (answer && answer.valueDate !== undefined && answer.valueDate !== null) {
      return answer.valueDate;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueDate) {
      return '';
    }
  };

  const getPDFValue = (): string | number => {
    const value = getValue(item, answer);
    if (value === undefined || value === null || value === '') {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.map(d => d && format(d, 'd. MMMM yyyy')).join(', ');
    }
    return format(value, 'd. MMMM yyyy');
  };

  const handleChange = (newDate: string | Date | undefined): void => {
    if (typeof newDate === 'string') {
      if (isValueFormatDDMMYYYY(newDate)) {
        const parsedDate = parseStringToDate(newDate);
        if (parsedDate && isValid(parsedDate)) {
          const formatedDate = format(parsedDate, 'yyyy-MM-dd');
          onDateValueChange(formatedDate);
        }
      } else {
        onDateValueChange(newDate);
      }
    } else if (isValid(newDate)) {
      const valueAsString = formatDateToString(newDate);
      const formatedDate = format(valueAsString, 'yyyy-MM-dd');
      onDateValueChange(formatedDate);
    }
  };

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    if (error) {
      const validationTextExtension = getValidationTextExtension(item);
      if (validationTextExtension) {
        return validationTextExtension;
      }
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
    <FormGroup error={getErrorText(error)} errorWrapperClassName={styles.paddingBottom}>
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
              if (Array.isArray(value)) {
                value = value[0];
              }
              if (typeof value === 'string') {
                return value ? validateDate(parseStringToDate(value), resources) : true;
              } else {
                return value ? validateDate(value, resources) : true;
              }
            },
            validMinDate: value => {
              return validateMinDate(minDateTime, parseStringToDate(value), resources);
            },
            validMaxDate: value => {
              return validateMaxDate(maxDateTime, parseStringToDate(value), resources);
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
            minDate={minDateTime}
            maxDate={maxDateTime}
            onChange={(_e, newDate) => {
              handleChange(newDate);
              onChange(newDate);
            }}
            dateValue={isValid(date) ? date : undefined}
          />
        )}
      />
    </FormGroup>
  );
};
