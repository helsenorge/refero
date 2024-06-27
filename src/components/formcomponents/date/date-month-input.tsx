import React, { useState } from 'react';

import { format } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { getId, isReadOnly, isRequired } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { getMonthOptions, getYearFromString, validateYearDigits, validateYearMax, validateYearMin } from '@/util/date-utils';

interface DateMonthProps extends FormProps, WithCommonFunctionsAndEnhancedProps {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  resources?: Resources;
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: string;
  subLabel?: string;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
  answer: QuestionnaireResponseItemAnswer;
}

export const DateYearMonthInput = ({
  id,
  idWithLinkIdAndItemIndex,
  pdf,
  item,
  resources,
  locale,
  label,
  subLabel,
  helpButton,
  helpElement,
  onDateValueChange,
  onRenderMarkdown,
  className,
  maxDate,
  minDate,
  answer,
  children,
}: React.PropsWithChildren<DateMonthProps>): JSX.Element => {
  const getDateValueFromAnswer = (answer: QuestionnaireResponseItemAnswer): string | undefined => {
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  };

  const getValue = () => {
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

  const [year, setYear] = useState<string | undefined>(getValue()?.year.toString());
  const [month, setMonth] = useState<string | undefined | null>(getValue()?.month?.toString());
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const yearField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-year`, formState);
  const monthsField = getFieldState(`${idWithLinkIdAndItemIndex}-yearmonth-month`, formState);
  const monthOptions = getMonthOptions(resources);

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

  const handleYearMonthChange = (newYear: string | undefined, newMonth: string | undefined | null) => {
    setYear(newYear);
    setMonth(newMonth);

    if (newYear && newMonth) {
      const concatinatedString = getConcatinatedYearAndMonth(newYear, newMonth);
      onDateValueChange(concatinatedString);
    }
  };

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={helpButton}
        helpElement={helpElement}
      >
        {children}
      </TextView>
    );
  }

  return (
    <>
      <FormGroup error={getErrorText(getCombinedFieldError())}>
        {helpElement}
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
                  afterLabelChildren={helpButton}
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
              defaultValue={month ?? '00'}
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

// const onYearMonthChange = (newValue: YearMonthValue): void => {
//   if (!newValue.year && (newValue.month === -1 || newValue.month === null)) {
//     onDateValueChange('');
//   } else {
//     const newMonthValue = newValue.month === null || newValue.month === -1 ? '' : `0${newValue.month + 1}`.slice(-2);
//     onDateValueChange(`${newValue.year}-${newMonthValue}`);
//   }
// };

// const getYearMonthInputResources = (): YearMonthResources => {
//   // Vi får maks én valideringstekst, derfor settes alle til denne.
//   const validationErrorText = getValidationTextExtension(item);

//   return {
//     errorInvalidYearMonth: validationErrorText ? validationErrorText : resources?.yearmonth_field_invalid || '',
//     errorInvalidYear: resources?.yearmonth_field_invalid_year || '',
//     errorRequiredField: resources?.yearmonth_field_required || '',
//     errorBeforeMinDate: resources?.yearmonth_field_mindate || '',
//     errorAfterMaxDate: resources?.yearmonth_field_maxdate || '',
//     selectYearPlaceholder: resources?.yearmonth_field_year_placeholder || '',
//     selectMonthPlaceholder: resources?.yearmonth_field_month_placeholder || '',
//   };
// };

{
  /* <YearMonthInput
  {...register(item.linkId, {
    required: isRequired(item),
  })}
  id={`${getId(id)}-yearmonth_input`}
  locale={locale} // TODO: må støtte nynorsk og samisk også
  resources={getYearMonthInputResources()}
  legend={label}
  subLabel={subLabel}
  isRequired={isRequired(item)}
  placeholder={getPlaceholder(item)}
  maximumYearMonth={getMinMaxDate(maxDate)}
  minimumYearMonth={getMinMaxDate(minDate)}
  value={getValue()}
  className={className}
  onChange={onYearMonthChange}
  helpButton={helpButton}
  helpElement={helpElement}
/>; */
}

// const getMinMaxDate = (dateValue: Date | undefined): YearMonthValue | undefined => {
//   return dateValue
//     ? {
//         year: dateValue.getFullYear(),
//         // Legger til 1 siden getMonth() returnerer en zero-based index (0-11)
//         month: dateValue.getMonth() + 1,
//       }
//     : undefined;
// };
