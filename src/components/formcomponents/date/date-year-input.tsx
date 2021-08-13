import * as React from 'react';

import { Moment } from 'moment';

import { QuestionnaireItem } from '../../../types/fhir';

import { Validation } from '@helsenorge/toolkit/components/molecules/form/validation';
import { YearErrorResources, YearInput } from '@helsenorge/toolkit/components/molecules/year-input';

import { getId, isRequired } from '../../../util';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';

interface Props {
  id?: string;
  item: QuestionnaireItem;
  resources?: Resources;
  label?: JSX.Element;
  subLabel?: JSX.Element;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  className?: string;
  yearValue?: number;
  maxDate?: Moment;
  minDate?: Moment;
}

export class DateYearInput extends React.Component<Props, {}> {
  getYearInputResources(): YearErrorResources {
    const { resources, item } = this.props;
    // Vi får maks én valideringstekst, derfor settes alle til denne.
    const validationErrorText = getValidationTextExtension(item);

    return {
      errorInvalidYear: validationErrorText ? validationErrorText : resources?.year_field_invalid || '',
      errorRequiredYear: resources?.year_field_required || '',
      errorYearBeforeMinDate: resources?.year_field_mindate || '',
      errorYearAfterMaxDate: resources?.year_field_maxdate || '',
    };
  }

  onYearChange = (year: number): void => {
    this.props.onDateValueChange(year === 0 ? '' : year.toString());
  };

  render(): JSX.Element {
    return (
      <Validation {...this.props}>
        <YearInput
          id={`${getId(this.props.id)}-year_input`}
          errorResources={this.getYearInputResources()}
          label={this.props.label}
          subLabel={this.props.subLabel}
          isRequired={isRequired(this.props.item)}
          placeholder={getPlaceholder(this.props.item)}
          maximumYear={this.props.maxDate?.year()}
          minimumYear={this.props.minDate?.year()}
          value={this.props.yearValue}
          className={this.props.className}
          onChange={this.onYearChange}
          helpButton={this.props.helpButton}
          helpElement={this.props.helpElement}
        />
      </Validation>
    );
  }
}
