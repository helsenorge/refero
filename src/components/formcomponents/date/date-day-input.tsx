import * as React from 'react';

import moment, { Moment } from 'moment';

import { QuestionnaireItem } from '../../../types/fhir';

import { DateRangePicker } from '@helsenorge/toolkit/components/molecules/date-range-picker';
import { DatePickerErrorPhrases } from '@helsenorge/toolkit/components/molecules/date-range-picker/date-range-picker-types';
import { Validation } from '@helsenorge/toolkit/components/molecules/form/validation';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import Constants from '../../../constants/index';
import { getId, isRequired } from '../../../util';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly } from '../../../util/index';
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
  datepickerRef: React.RefObject<DateRangePicker>;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  validationErrorRenderer?: JSX.Element;
  className?: string;
  dateValue?: Date;
  maxDate?: Moment;
  minDate?: Moment;
}

export class DateDayInput extends React.Component<Props, {}> {
  getDatepickerErrorPhrases(): DatePickerErrorPhrases {
    const { resources, item } = this.props;
    // Vi får maks én valideringstekst, derfor settes alle til denne.
    const validationErrorText = getValidationTextExtension(item);

    return {
      errorInvalidDate: validationErrorText ? validationErrorText : resources?.filterDateErrorDateFormat || '',
      errorAfterMaxDate: resources?.errorAfterMaxDate || '',
      errorBeforeMinDate: resources?.errorBeforeMinDate || '',
      errorInvalidDateRange: '',
      errorRequiredDate: resources?.dateRequired || '',
      errorRequiredDateRange: '',
      errorInvalidMinimumNights: '',
    };
  }

  toLocaleDate(moment: Moment | undefined): Moment | undefined {
    return moment ? moment.locale(this.props.locale) : undefined;
  }

  onDateChange = (value: Moment | null): void => {
    const newValue = value ? moment(value).format(Constants.DATE_FORMAT) : '';
    this.props.onDateValueChange(newValue);
  };

  getReadonlyValue = (): string => {
    const date = this.props.dateValue;
    const ikkeBesvartText = this.props.resources?.ikkeBesvart || '';

    return date ? moment(date).format('D. MMMM YYYY') : ikkeBesvartText;
  };

  render(): JSX.Element {
    if (this.props.pdf || isReadOnly(this.props.item)) {
      return (
        <TextView id={this.props.id} item={this.props.item} value={this.getReadonlyValue()} onRenderMarkdown={this.props.onRenderMarkdown}>
          {this.props.children}
        </TextView>
      );
    }

    return (
      <Validation {...this.props}>
        <DateRangePicker
          type="single"
          id={`${getId(this.props.id)}-datepicker_input`}
          locale={this.props.locale} // TODO: må støtte nynorsk og samisk også
          errorResources={this.getDatepickerErrorPhrases()}
          resources={this.props.resources}
          label={this.props.label}
          subLabel={this.props.subLabel}
          isRequired={isRequired(this.props.item)}
          placeholder={getPlaceholder(this.props.item)}
          ref={this.props.datepickerRef}
          maximumDate={this.toLocaleDate(this.props.maxDate)}
          minimumDate={this.toLocaleDate(this.props.minDate)}
          singleDateValue={this.props.dateValue ? this.toLocaleDate(moment(this.props.dateValue)) : undefined}
          className={this.props.className}
          onDateChange={this.onDateChange}
          validationErrorRenderer={this.props.validationErrorRenderer}
          helpButton={this.props.helpButton}
          helpElement={this.props.helpElement}
        />
      </Validation>
    );
  }
}
