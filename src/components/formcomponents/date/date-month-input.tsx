import { useState } from 'react';
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
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useMinMaxDate } from './useMinMaxDate';

import styles from '../../../styles/date-year-month.module.css';
import { useExternalRenderContext } from '@/context/externalRenderContext';

type DateMonthProps = QuestionnaireComponentItemProps & {
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  onDateValueChange: (newValue: string) => void;
};

export const DateYearMonthInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  item,
  responseItem,
  onDateValueChange,
  children,
}: DateMonthProps): JSX.Element | null => {
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const answer = useGetAnswer(responseItem, item);
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

  const getValue = (
    item: QuestionnaireItem,
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

  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const yearField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-year`, formState);
  const monthsField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-month`, formState);
  const monthOptions = getMonthOptions(resources);
  const [year, setYear] = useState<string | undefined>(getYearAndMonth()?.year.toString());
  const [month, setMonth] = useState<string | undefined | null>(getYearAndMonth()?.month?.toString());

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
    setYear(newYear);
    setMonth(newMonth);

    if (newYear && newMonth) {
      const concatinatedString = getConcatinatedYearAndMonth(newYear, newMonth);
      onDateValueChange(concatinatedString);
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
    <>
      <FormGroup error={getErrorText(getCombinedFieldError())} errorWrapperClassName={styles2.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-input`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label-test`}
          sublabelId={`${getId(id)}-sublabel`}
          afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
        />
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
                  return validateYearDigits(getYearFromString(value), resources);
                },
                validMinDate: value => {
                  return validateYearMin(minDateTime, Number(getYearFromString(value)), resources);
                },
                validMaxDate: value => {
                  return validateYearMax(maxDateTime, Number(getYearFromString(value)), resources);
                },
              },
            }}
            render={({ field: { onChange } }): JSX.Element => (
              <Input
                type="number"
                inputId={`${getId(id)}-input`}
                testId={getId(id)}
                onChange={e => {
                  handleYearMonthChange(e.target.value, month);
                  onChange(getConcatinatedYearAndMonth(e.target.value, month));
                }}
                width={10}
                defaultValue={year ?? ''}
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
                  handleYearMonthChange(year, e.target.value);
                  onChange(getConcatinatedYearAndMonth(year, e.target.value));
                }}
                defaultValue={month ? month : monthOptions[0].optionValue}
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
