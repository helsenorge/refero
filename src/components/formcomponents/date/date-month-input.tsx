import * as React from 'react';

import moment, { Moment } from 'moment';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import { YearMonthResources, YearMonthInput, YearMonthValue } from '@helsenorge/date-time/components/year-month-input';
import { Validation } from '@helsenorge/form/components/form/validation';

import { getId, isReadOnly, isRequired } from '../../../util';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import TextView from '../textview';

interface Props {
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

export class DateYearMonthInput extends React.Component<Props, {}> {
  getYearMonthInputResources(): YearMonthResources {
    const { resources, item } = this.props;
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
  }

  onYearMonthChange = (newValue: YearMonthValue): void => {
    if (!newValue.year && (newValue.month === -1 || newValue.month === null)) {
      this.props.onDateValueChange('');
    } else {
      const newMonthValue = newValue.month === null || newValue.month === -1 ? '' : `0${newValue.month + 1}`.slice(-2);
      this.props.onDateValueChange(`${newValue.year}-${newMonthValue}`);
    }
  };

  getDateValueFromAnswer = (answer: QuestionnaireResponseItemAnswer): string | undefined => {
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  };

  getValue = (): YearMonthValue | undefined => {
    const { answer } = this.props;    
    const stringValue = this.getDateValueFromAnswer(answer);

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

  getMinMaxDate = (dateValue: Moment | undefined): YearMonthValue | undefined => {
    return dateValue
      ? {
          year: dateValue.year(),
          month: dateValue.month(),
        }
      : undefined;
  };

  convertToPDFValue = (answer: QuestionnaireResponseItemAnswer): string => {
    const value = this.getDateValueFromAnswer(answer);
    return moment(value).locale(this.props.locale).format('MMMM YYYY')
  };

  getPDFValue = (): string => {
    const ikkeBesvartText = this.props.resources?.ikkeBesvart || '';
    if (Array.isArray(this.props.answer)) {
      return this.props.answer.map(m => this.convertToPDFValue(m)).join(', ');
    }
    return ikkeBesvartText;
  };

  render(): JSX.Element {
    if (this.props.pdf || isReadOnly(this.props.item)) {
      return (
        <TextView
          id={this.props.id}
          item={this.props.item}
          value={this.getPDFValue()}
          onRenderMarkdown={this.props.onRenderMarkdown}
          helpButton={this.props.helpButton}
          helpElement={this.props.helpElement}
        >
          {this.props.children}
        </TextView>
      );
    }

    return (
      <Validation {...this.props}>
        <YearMonthInput
          id={`${getId(this.props.id)}-yearmonth_input`}
          locale={this.props.locale} // TODO: må støtte nynorsk og samisk også
          resources={this.getYearMonthInputResources()}
          legend={this.props.label}
          subLabel={this.props.subLabel}
          isRequired={isRequired(this.props.item)}
          placeholder={getPlaceholder(this.props.item)}
          maximumYearMonth={this.getMinMaxDate(this.props.maxDate)}
          minimumYearMonth={this.getMinMaxDate(this.props.minDate)}
          value={this.getValue()}
          className={this.props.className}
          onChange={this.onYearMonthChange}
          helpButton={this.props.helpButton}
          helpElement={this.props.helpElement}
        />
      </Validation>
    );
  }
}
