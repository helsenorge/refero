import { useEffect, useState } from 'react';
import styles2 from '../common-styles.module.css';
import { getYear } from 'date-fns';
import { QuestionnaireItem } from 'fhir/r4';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Select from '@helsenorge/designsystem-react/components/Select';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { getId, isReadOnly, isRequired } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';

import {
  getMonthOptions,
  getPDFValueForDate,
  getYearFromString,
  validateYearDigits,
  validateYearMonthMax,
  validateYearMonthMin,
} from '@/util/date-utils';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useMinMaxDate } from './useMinMaxDate';

import styles from '../../../styles/date-year-month.module.css';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { GlobalState } from '@/reducers';
import { useSelector } from 'react-redux';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { initialize } from '@/util/date-fns-utils';
import { DateFormat } from '@/types/dateTypes';
import { ReadOnly } from '../read-only/readOnly';

type DateMonthProps = QuestionnaireComponentItemProps & {
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
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
  initialize();

  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const answer = useGetAnswer(linkId, path);
  const { formState, getFieldState, setValue, getValues, trigger, register } = useFormContext<FieldValues>();
  const { resources } = useExternalRenderContext();
  const { minDateTime, maxDateTime } = useMinMaxDate(item);

  const getDateValueFromAnswer = (): string | undefined => {
    if (!answer) return undefined;

    const answerItem = Array.isArray(answer) ? answer[0] : answer;
    return answerItem ? answerItem.valueDate ?? answerItem.valueDateTime : '';
  };
  const dateValue = getDateValueFromAnswer();

  const getYearAndMonth = (): { year: number; month: string | null } | undefined => {
    if (!dateValue) {
      return undefined;
    } else {
      const yearValue = parseInt(dateValue.split('-')[0]) || 0;
      const monthValue = dateValue.split('-')[1];
      return {
        year: yearValue,
        month: monthValue,
      };
    }
  };

  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const yearField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-year`, formState);
  const monthsField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-month`, formState);
  const monthOptions = getMonthOptions(resources);
  const year: string | undefined = getYearAndMonth()?.year.toString() || '';
  const month: string | undefined | null = getYearAndMonth()?.month || '';
  const pdfValue = getPDFValueForDate(dateValue, resources?.ikkeBesvart, DateFormat.yyyyMM, DateFormat.MMMMyyyy);

  useEffect(() => {
    setValue(`${idWithLinkIdAndItemIndex}-yearmonth-year`, year);
    setValue(`${idWithLinkIdAndItemIndex}-yearmonth-month`, month);
  }, []);

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    if (error) {
      const validationTextExtension = getValidationTextExtension(item);
      if (validationTextExtension) {
        return validationTextExtension;
      }
      return error.message;
    }
  };

  const getCombinedFieldError = (): FieldError | undefined => {
    const error = yearField.error || monthsField.error || undefined;
    return error;
  };

  const getConcatinatedYearAndMonth = (newYear: string | undefined, newMonth: string | undefined | null): string => {
    const newYearString = newYear?.padStart(2, '0');
    const newMonthString = newMonth?.padStart(2, '0');
    return `${newYearString}-${newMonthString}`;
  };

  const handleYearChange = (newYear: string | undefined, newMonth: string | undefined | null): void => {
    let newValue = '';
    if (newYear && newMonth) {
      newValue = getConcatinatedYearAndMonth(newYear, newMonth);
    } else if (newYear) {
      newValue = newYear;
    }
    onDateValueChange(newValue);
  };
  const handleMonthChange = (newYear: string | undefined, newMonth: string | undefined | null): void => {
    if (formState.isSubmitted) {
      trigger(idWithLinkIdAndItemIndex + '-yearmonth-year');
    }
    let newValue = '';
    if (newYear && newMonth) {
      newValue = getConcatinatedYearAndMonth(newYear, newMonth);
    } else if (newMonth) {
      newValue = `${getYear(new Date())}-${newMonth}`;
    }
    onDateValueChange(newValue);
  };

  const doesAnyFieldsHaveValue = (): boolean => {
    const yearValue = getValues(idWithLinkIdAndItemIndex + '-yearmonth-year');
    const monthValue = getValues(idWithLinkIdAndItemIndex + '-yearmonth-month');
    return yearValue || monthValue;
  };

  const registerMonth = register(`${idWithLinkIdAndItemIndex}-yearmonth-month`, {
    required: {
      value: isRequired(item),
      message: resources?.yearmonth_field_required || '',
    },
    shouldUnregister: true,
  });
  const registerYear = register(`${idWithLinkIdAndItemIndex}-yearmonth-year`, {
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
  });

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly pdf={pdf} id={id} item={item} pdfValue={pdfValue} errors={getCombinedFieldError()}>
        {children}
      </ReadOnly>
    );
  }
  return (
    <FormGroup error={getErrorText(getCombinedFieldError())} errorWrapperClassName={styles2.paddingBottom}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-input`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
      >
        <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
      </ReferoLabel>
      <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
      <div className={styles.yearMonthWrapper}>
        <Input
          {...registerYear}
          type="number"
          inputId={`${getId(id)}-input`}
          testId={getId(id)}
          onChange={e => {
            const monthValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-month`);
            handleYearChange(e.target.value, monthValue);
            registerYear.onChange(e);
          }}
          width={10}
          value={year}
        />
        <Select
          {...registerMonth}
          className={styles.monthSelect}
          selectId={`${getId(id)}-select`}
          testId={'month-select'}
          onChange={e => {
            const yearValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-year`);
            handleMonthChange(yearValue, e.target.value);
            registerMonth.onChange(e);
          }}
          value={month ?? monthOptions[0].optionValue}
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
