import { useEffect, useState } from 'react';
import styles2 from '../common-styles.module.css';
import { format, getYear, isValid, parse } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Select from '@helsenorge/designsystem-react/components/Select';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { getId, isReadOnly, isRequired } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';

import TextView from '../textview';

import { getMonthOptions, getYearFromString, validateYearDigits, validateYearMonthMax, validateYearMonthMin } from '@/util/date-utils';
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

  const { formState, getFieldState, setValue, getValues, trigger } = useFormContext<FieldValues>();
  const answer = useGetAnswer(linkId, path);
  const { resources } = useExternalRenderContext();
  const { minDateTime, maxDateTime } = useMinMaxDate(item);

  const getDateValueFromAnswer = (
    answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined
  ): string | undefined => {
    if (!answer) return undefined;

    const answerItem = Array.isArray(answer) ? answer[0] : answer;
    return answerItem ? answerItem.valueDate ?? answerItem.valueDateTime : '';
  };

  const getYearAndMonth = (): { year: number; month: string | null } | undefined => {
    const stringValue = getDateValueFromAnswer(answer);

    if (!stringValue) {
      return undefined;
    } else {
      const yearValue = parseInt(stringValue.split('-')[0]) || 0;
      const monthValue = stringValue.split('-')[1];
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

  useEffect(() => {
    setValue(`${idWithLinkIdAndItemIndex}-yearmonth-year`, year);
    setValue(`${idWithLinkIdAndItemIndex}-yearmonth-month`, month);
  }, []);

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
      return value
        .map(d => {
          const valueParsed = parse(d, DateFormat.yyyyMM, new Date());
          if (isValid(valueParsed)) {
            return format(d, 'MMMM yyyy');
          }
        })
        .join(', ');
    }
    const valueParsed = parse(value, DateFormat.yyyyMM, new Date());
    if (isValid(valueParsed)) {
      return format(valueParsed, 'MMMM yyyy');
    }
    return value;
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

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue()}>
        {children}
      </TextView>
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
        <Controller
          name={`${idWithLinkIdAndItemIndex}-yearmonth-year`}
          shouldUnregister={true}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.yearmonth_field_required || '',
            },
            validate: {
              validYear: value => {
                return doesAnyFieldsHaveValue() ? validateYearDigits(getYearFromString(value), resources) : true;
              },
              validMinDate: value => {
                const monthValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-year`);
                return doesAnyFieldsHaveValue() ? validateYearMonthMin(minDateTime, getYearFromString(value), monthValue, resources) : true;
              },
              validMaxDate: value => {
                const monthValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-year`);
                return doesAnyFieldsHaveValue() ? validateYearMonthMax(maxDateTime, getYearFromString(value), monthValue, resources) : true;
              },
            },
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Input
              {...rest}
              type="number"
              inputId={`${getId(id)}-input`}
              testId={getId(id)}
              onChange={e => {
                const monthValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-month`);
                handleYearChange(e.target.value, monthValue);
                onChange(e.target.value);
              }}
              width={10}
              value={year}
            />
          )}
        />
        <Controller
          name={`${idWithLinkIdAndItemIndex}-yearmonth-month`}
          shouldUnregister={true}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.yearmonth_field_required || '',
            },
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Select
              {...rest}
              className={styles.monthSelect}
              selectId={`${getId(id)}-select`}
              testId={'month-select'}
              onChange={e => {
                const yearValue = getValues(`${idWithLinkIdAndItemIndex}-yearmonth-year`);
                handleMonthChange(yearValue, e.target.value);
                onChange(e.target.value);
              }}
              value={month ?? monthOptions[0].optionValue}
            >
              {monthOptions.map(option => (
                <option key={option.optionValue} value={option.optionValue}>
                  {option.optionName}
                </option>
              ))}
            </Select>
          )}
        />
      </div>
    </FormGroup>
  );
};
