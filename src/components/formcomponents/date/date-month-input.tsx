import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import moment, { Moment } from 'moment';

import { Resources } from '../../../types/resources';

import Validation from '@helsenorge/designsystem-react/components/Validation';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import { YearMonthResources, YearMonthInput, YearMonthValue } from '@helsenorge/date-time/components/year-month-input';

import { getId, isReadOnly, isRequired } from '../../../util';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import TextView from '../textview';

interface DateYearMonthInputProps {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  resources?: Resources;
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: JSX.Element;
  subLabel?: JSX.Element;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  className?: string;
  maxDate?: Moment;
  minDate?: Moment;
  answer: QuestionnaireResponseItemAnswer;
}

export const DateYearMonthInput: React.FC<DateYearMonthInputProps> = props => {
  const getYearMonthInputResources = (): YearMonthResources => {
    const { resources, item } = props;
    // Vi får maks én valideringstekst, derfor settes alle til denne.
    const validationErrorText = getValidationTextExtension(item);

    return {
      errorInvalidYearMonth: validationErrorText ? validationErrorText : resources?.yearmonth_field_invalid || '',
      errorInvalidYear: resources?.yearmonth_field_invalid_year || '',
      errorRequiredField: resources?.yearmonth_field_required || '',
      errorBeforeMinDate: resources?.yearmonth_field_mindate || '',
      errorAfterMaxDate: resources?.yearmonth_field_maxdate || '',
      selectYearPlaceholder: resources?.yearmonth_field_year_placeholder || '',
      selectMonthPlaceholder: resources?.yearmonth_field_month_placeholder || '',
    };
  };

  const onYearMonthChange = (newValue: YearMonthValue): void => {
    if (!newValue.year && (newValue.month === -1 || newValue.month === null)) {
      props.onDateValueChange('');
    } else {
      const newMonthValue = newValue.month === null || newValue.month === -1 ? '' : `0${newValue.month + 1}`.slice(-2);
      props.onDateValueChange(`${newValue.year}-${newMonthValue}`);
    }
  };

  const getDateValueFromAnswer = (answer: QuestionnaireResponseItemAnswer): string | undefined => {
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  };

  const getValue = (): YearMonthValue | undefined => {
    const { answer } = props;
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

  const getMinMaxDate = (dateValue: Moment | undefined): YearMonthValue | undefined => {
    return dateValue
      ? {
          year: dateValue.year(),
          month: dateValue.month(),
        }
      : undefined;
  };

  const convertToPDFValue = (answer: QuestionnaireResponseItemAnswer): string => {
    const value = getDateValueFromAnswer(answer);
    return moment(value).locale(props.locale).format('MMMM YYYY');
  };

  const getPDFValue = (): string => {
    const ikkeBesvartText = props.resources?.ikkeBesvart || '';
    if (Array.isArray(props.answer)) {
      return props.answer.map(m => convertToPDFValue(m)).join(', ');
    }
    return ikkeBesvartText;
  };

  if (props.pdf || isReadOnly(props.item)) {
    return (
      <TextView
        id={props.id}
        item={props.item}
        value={getPDFValue()}
        onRenderMarkdown={props.onRenderMarkdown}
        helpButton={props.helpButton}
        helpElement={props.helpElement}
      >
        {props.children}
      </TextView>
    );
  }

  return (
    <Validation {...props}>
      <YearMonthInput
        id={`${getId(props.id)}-yearmonth_input`}
        locale={props.locale} // TODO: må støtte nynorsk og samisk også
        resources={getYearMonthInputResources()}
        legend={props.label}
        subLabel={props.subLabel}
        isRequired={isRequired(props.item)}
        placeholder={getPlaceholder(props.item)}
        maximumYearMonth={getMinMaxDate(props.maxDate)}
        minimumYearMonth={getMinMaxDate(props.minDate)}
        value={getValue()}
        className={props.className}
        onChange={onYearMonthChange}
        helpButton={props.helpButton}
        helpElement={props.helpElement}
      />
    </Validation>
  );
};
