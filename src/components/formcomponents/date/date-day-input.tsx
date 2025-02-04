import { useEffect, useState } from 'react';

import { format, isValid } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import DatePicker from '@helsenorge/datepicker/components/DatePicker';


import { useMinMaxDate } from './useMinMaxDate';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useResetFormField } from '@/hooks/useResetFormField';
import { GlobalState } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { DateFormat, defaultMaxDate, defaultMinDate } from '@/types/dateTypes';
import { initialize } from '@/util/date-fns-utils';
import { getPDFValueForDate, parseStringToDate, validateDate, validateMaxDate, validateMinDate } from '@/util/date-utils';

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

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
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
  const dateAnswerValueParsed = parseStringToDate(dateAnswerValue);
  const [dateValue, setDateValue] = useState(dateAnswerValueParsed);
  const pdfValue = getPDFValueForDate(dateAnswerValue, resources?.ikkeBesvart, DateFormat.yyyyMMdd, DateFormat.dMMyyyy);
  useResetFormField(idWithLinkIdAndItemIndex, dateAnswerValue);

  useEffect(() => {
    if (isValid(dateAnswerValueParsed)) {
      setDateValue(dateAnswerValueParsed);
    }
  }, [dateAnswerValue]);

  const handleChange = (newDate: string | Date | undefined): void => {
    if (typeof newDate === 'string') {
      const parsedDate = parseStringToDate(newDate);
      if (parsedDate && isValid(parsedDate)) {
        setDateValue(parsedDate);
        onDateValueChange(format(parsedDate, DateFormat.yyyyMMdd));
      } else {
        onDateValueChange(newDate);
      }
    } else {
      if (newDate && isValid(newDate)) {
        setDateValue(newDate);
        onDateValueChange(format(newDate, DateFormat.yyyyMMdd));
      }
    }
  };

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
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
    shouldUnregister: true,
  };
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={dateAnswerValue}
        pdfValue={pdfValue}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <FormGroup error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-datepicker`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
        dateLabel={resources?.dateFormat_ddmmyyyy}
      />

      <DatePicker
        {...rest}
        inputId={`${getId(id)}-datepicker`}
        testId={`${getId(id)}-datepicker-test`}
        autoComplete=""
        dateButtonAriaLabel="Open datepicker"
        dateFormat={'dd.MM.yyyy'}
        minDate={minDateTime ?? defaultMinDate}
        maxDate={maxDateTime ?? defaultMaxDate}
        onChange={(e, newDate) => {
          handleChange(newDate);
          onChange(e);
        }}
        dateValue={isValid(dateValue) ? dateValue : undefined}
      />
    </FormGroup>
  );
};
