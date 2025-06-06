import { useEffect } from 'react';

import { FieldError, FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Select from '@helsenorge/designsystem-react/components/Select';

import { useMinMaxDate } from './useMinMaxDate';
import styles from '../../../styles/date-year-month.module.css';
import { getId, isReadOnly, isRequired } from '../../../util';
import styles2 from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { DateFormat } from '@/types/dateTypes';
import {
  getMonthOptions,
  getPDFValueForDate,
  getYearFromString,
  validateYearDigits,
  validateYearMonthMax,
  validateYearMonthMin,
} from '@/util/date-utils';

type DateMonthProps = QuestionnaireComponentItemProps & {
  onDateValueChange: (newValue: string) => void;
};

export const DateYearMonthInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  linkId,
  onDateValueChange,
  children,
  path,
}: DateMonthProps): JSX.Element | null => {
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const answer = useGetAnswer(linkId, path);
  const { formState, getFieldState, setValue, getValues, trigger, register } = useFormContext<FieldValues>();
  const { resources } = useExternalRenderContext();
  const { minDateTime, maxDateTime } = useMinMaxDate(item);

  const getDateValueFromAnswer = (): string | undefined => {
    if (!answer) return undefined;

    const answerItem = Array.isArray(answer) ? answer[0] : answer;
    return answerItem ? (answerItem.valueDate ?? answerItem.valueDateTime) : '';
  };
  const dateValue = getDateValueFromAnswer();

  const getYearAndMonth = (): { year: number | string; month: string | null } | undefined => {
    if (!dateValue) {
      return undefined;
    } else {
      const yearValue = parseInt(dateValue.split('-')[0]) || '';
      const monthValue = dateValue.split('-')[1];
      return {
        year: yearValue,
        month: monthValue,
      };
    }
  };

  const yearField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-year`, formState);
  const monthsField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-month`, formState);
  const monthOptions = getMonthOptions(resources);
  const year = getYearAndMonth()?.year.toString() || '';
  const month = getYearAndMonth()?.month || '';
  const pdfValue = getPDFValueForDate(dateValue, resources?.ikkeBesvart, DateFormat.yyyyMM, DateFormat.MMMMyyyy);
  useResetFormField(`${idWithLinkIdAndItemIndex}-yearmonth-year`, year);
  useResetFormField(`${idWithLinkIdAndItemIndex}-yearmonth-month`, month);

  useEffect(() => {
    setValue(`${idWithLinkIdAndItemIndex}-yearmonth-year`, year);
    setValue(`${idWithLinkIdAndItemIndex}-yearmonth-month`, month);
  }, []);

  const getCombinedFieldError = (): FieldError | undefined => {
    const error = yearField.error || monthsField.error || undefined;
    return error;
  };

  const getConcatinatedYearAndMonth = (newYear: string | undefined, newMonth: string | undefined | null): string => {
    return `${newYear}-${newMonth}`;
  };

  const handleYearChange = (newYear: string | undefined, newMonth: string | undefined | null): void => {
    let newValue = '';
    if (newMonth) {
      newValue = getConcatinatedYearAndMonth(newYear, newMonth);
    } else {
      newValue = getConcatinatedYearAndMonth(newYear, '');
    }
    onDateValueChange(newValue);
  };
  const handleMonthChange = (newYear: string | undefined, newMonth: string | undefined | null): void => {
    trigger(idWithLinkIdAndItemIndex + '-yearmonth-year');
    let newValue = '';
    if (newYear) {
      newValue = getConcatinatedYearAndMonth(newYear, newMonth);
    } else {
      newValue = getConcatinatedYearAndMonth('', newMonth);
    }
    onDateValueChange(newValue);
  };

  const doesAnyFieldsHaveValue = (): boolean => {
    const yearValue = getValues(idWithLinkIdAndItemIndex + '-yearmonth-year');
    const monthValue = getValues(idWithLinkIdAndItemIndex + '-yearmonth-month');
    return yearValue || monthValue;
  };

  const validationRulesYear: RegisterOptions<FieldValues, string> | undefined = {
    required: {
      value: isRequired(item),
      message: resources?.yearmonth_field_required || '',
    },
    validate: {
      validYear: value => {
        return doesAnyFieldsHaveValue() ? validateYearDigits(getYearFromString(value), resources) : true;
      },
      validMinDate: value => {
        const monthValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-month`);
        return doesAnyFieldsHaveValue() ? validateYearMonthMin(minDateTime, getYearFromString(value), monthValue, resources) : true;
      },
      validMaxDate: value => {
        const monthValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-month`);
        return doesAnyFieldsHaveValue() ? validateYearMonthMax(maxDateTime, getYearFromString(value), monthValue, resources) : true;
      },
    },
    shouldUnregister: true,
  };

  const validationRulesMonth: RegisterOptions<FieldValues, string> | undefined = {
    required: {
      value: isRequired(item),
      message: resources?.yearmonth_field_required || '',
    },
    shouldUnregister: true,
  };

  const { onChange: onChangeYear, ...restYear } = register(
    `${idWithLinkIdAndItemIndex}-yearmonth-year`,
    shouldValidate(item, pdf) ? validationRulesYear : undefined
  );
  const { onChange: onChangeMonth, ...restMonth } = register(
    `${idWithLinkIdAndItemIndex}-yearmonth-month`,
    shouldValidate(item, pdf) ? validationRulesMonth : undefined
  );

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly pdf={pdf} id={id} item={item} pdfValue={pdfValue} errors={getCombinedFieldError()}>
        {children}
      </ReadOnly>
    );
  }
  return (
    <FormGroup error={getErrorMessage(item, getCombinedFieldError())} errorWrapperClassName={styles2.paddingBottom}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-input`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
      />
      <div className={styles.yearMonthWrapper}>
        <Input
          {...restYear}
          type="number"
          inputId={`${getId(id)}-input`}
          testId={getId(id)}
          onChange={e => {
            const monthValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-month`);
            handleYearChange(e.target.value, monthValue);
            onChangeYear(e);
          }}
          width={5}
          value={year}
          label={resources?.dateLabel_year}
        />
        <Select
          {...restMonth}
          className={styles.monthSelect}
          selectId={`${getId(id)}-select`}
          testId={'month-select'}
          onChange={e => {
            const yearValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-year`);
            handleMonthChange(yearValue, e.target.value);
            onChangeMonth(e);
          }}
          value={month ?? monthOptions[0].optionValue}
          label={resources?.dateLabel_month}
        >
          {monthOptions.map(option => (
            <option key={option.optionValue} value={option.optionValue}>
              {option.optionName}
            </option>
          ))}
        </Select>
      </div>
    </FormGroup>
  );
};
