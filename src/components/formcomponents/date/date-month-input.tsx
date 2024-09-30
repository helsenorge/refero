import { useEffect, useState } from 'react';
import styles2 from '../common-styles.module.css';
import { format } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Select from '@helsenorge/designsystem-react/components/Select';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { getId, isReadOnly, isRequired } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';

import TextView from '../textview';

import { getMonthOptions, getYearFromString, validateYearDigits, validateYearMax, validateYearMin } from '@/util/date-utils';
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

  const { setValue, formState, getFieldState, getValues } = useFormContext<FieldValues>();
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
  const year: string | undefined = getYearAndMonth()?.year.toString();
  const month: string | undefined | null = getYearAndMonth()?.month?.toString();

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
      return value.map(d => d && format(d, 'MMMM yyyy')).join(', ');
    }
    return format(value, 'MMMM yyyy');
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

  const handleYearMonthChange = (newYear: string | undefined, newMonth: string | undefined | null): void => {
    if (newYear && newMonth) {
      const concatinatedString = getConcatinatedYearAndMonth(newYear, newMonth);
      onDateValueChange(concatinatedString);
    }
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
    <>
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
            name={idWithLinkIdAndItemIndex + '-yearmonth-year'}
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
                  return doesAnyFieldsHaveValue() ? validateYearMin(minDateTime, Number(getYearFromString(value)), resources) : true;
                },
                validMaxDate: value => {
                  return doesAnyFieldsHaveValue() ? validateYearMax(maxDateTime, Number(getYearFromString(value)), resources) : true;
                },
              },
            }}
            render={({ field: { onChange } }): JSX.Element => (
              <Input
                type="number"
                inputId={`${getId(id)}-input`}
                testId={getId(id)}
                onChange={e => {
                  const monthValue = getValues(idWithLinkIdAndItemIndex + '-yearmonth-month');
                  handleYearMonthChange(e.target.value, monthValue);
                  onChange(e.target.value);
                }}
                width={10}
                defaultValue={year ?? ''}
                value={year}
              />
            )}
          />
          <Controller
            name={idWithLinkIdAndItemIndex + '-yearmonth-month'}
            shouldUnregister={true}
            rules={{
              required: {
                value: isRequired(item),
                message: resources?.yearmonth_field_required || '',
              },
            }}
            render={({ field: { onChange } }): JSX.Element => (
              <Select
                className={styles.monthSelect}
                selectId={`${getId(id)}-select`}
                testId={'month-select'}
                onChange={e => {
                  const yearValue = getValues(idWithLinkIdAndItemIndex + '-yearmonth-year');
                  handleYearMonthChange(yearValue, e.target.value);
                  onChange(e.target.value);
                }}
                defaultValue={month ?? monthOptions[0].optionValue}
                value={month}
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
    </>
  );
};
