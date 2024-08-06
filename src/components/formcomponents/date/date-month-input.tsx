import React, { useState } from 'react';

import { format } from 'date-fns';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { getId, isReadOnly, isRequired } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';

import TextView from '../textview';

import { getMonthOptions, getYearFromString, validateYearDigits, validateYearMax, validateYearMin } from '@/util/date-utils';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import { RenderItemProps } from '../renderChildren/RenderChildrenItems';

type DateMonthProps = RenderItemProps & {
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: string;
  subLabel?: string;
  onDateValueChange: (newValue: string) => void;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
  answer: QuestionnaireResponseItemAnswer;
  children: React.ReactNode;
};

export const DateYearMonthInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  item,
  resources,
  label,
  subLabel,
  onDateValueChange,
  maxDate,
  minDate,
  answer,
  children,
}: DateMonthProps): JSX.Element => {
  const { formState, getFieldState } = useFormContext<FieldValues>();

  const getDateValueFromAnswer = (answer: QuestionnaireResponseItemAnswer): string | undefined => {
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  };

  const getValue = (): { year: number; month: number | null } | undefined => {
    const stringValue = getDateValueFromAnswer(answer);

    if (!stringValue) {
      return undefined;
    } else {
      const monthPart = stringValue.split('-')[1];
      const yearValue = parseInt(stringValue.split('-')[0]) || 0;
      const monthValue = monthPart === '' || monthPart === undefined ? null : parseInt(stringValue.split('-')[1]) - 1;
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
  const [year, setYear] = useState<string | undefined>(getValue()?.year.toString());
  const [month, setMonth] = useState<string | undefined | null>(getValue()?.month?.toString() || monthOptions[0].optionValue);

  const convertToPDFValue = (answer: QuestionnaireResponseItemAnswer): string => {
    const value = getDateValueFromAnswer(answer);
    return value ? format(value, 'MMMM yyyy') : '';
  };

  const getPDFValue = (): string => {
    const ikkeBesvartText = resources?.ikkeBesvart || '';
    if (Array.isArray(answer)) {
      return answer.map(m => convertToPDFValue(m)).join(', ');
    }
    return ikkeBesvartText;
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
      <FormGroup error={getErrorText(getCombinedFieldError())}>
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
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
                return validateYearMin(minDate, Number(getYearFromString(value)), resources);
              },
              validMaxDate: value => {
                return validateYearMax(maxDate, Number(getYearFromString(value)), resources);
              },
            },
          }}
          render={({ field: { onChange } }): JSX.Element => (
            <Input
              type="number"
              testId={getId(id)}
              onChange={e => {
                handleYearMonthChange(e.target.value, month);
                onChange(getConcatinatedYearAndMonth(e.target.value, month));
              }}
              label={
                <Label
                  labelId={`${getId(id)}-label-yearmonth`}
                  labelTexts={[{ text: label || '' }]}
                  sublabel={
                    <Sublabel id={`${getId(id)}-sublabel-dateYearMonth`} sublabelTexts={[{ text: subLabel || '', type: 'normal' }]} />
                  }
                  afterLabelChildren={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
                />
              }
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
              label={<Label labelTexts={[{ text: 'Velg noe', type: 'semibold' }]} />}
              onChange={e => {
                handleYearMonthChange(year, e.target.value);
                onChange(getConcatinatedYearAndMonth(year, e.target.value));
              }}
              width={10}
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
      </FormGroup>
    </>
  );
};
