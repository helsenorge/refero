import * as React from 'react';

import { Moment } from 'moment';

import { QuestionnaireItem } from '../../../types/fhir';

import { Validation } from '@helsenorge/toolkit/components/molecules/form/validation';
import { YearMonthResources, YearMonthInput, YearMonthValue } from '@helsenorge/toolkit/components/molecules/year-month-input';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { getId, isRequired } from '../../../util';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';

interface Props {
  id?: string;
  item: QuestionnaireItem;
  resources?: Resources;
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: JSX.Element;
  subLabel?: JSX.Element;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  className?: string;
  yearMonthValue?: string;
  maxDate?: Moment;
  minDate?: Moment;
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

  getValue = (): YearMonthValue | undefined => {
    if (!this.props.yearMonthValue) {
      return undefined;
    } else {
      const monthPart = this.props.yearMonthValue.split('-')[1];
      const yearValue = parseInt(this.props.yearMonthValue.split('-')[0]) || 0;
      const monthValue = monthPart === '' || monthPart === undefined ? null : parseInt(this.props.yearMonthValue.split('-')[1]) - 1;
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

  render(): JSX.Element {
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
