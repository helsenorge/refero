import * as React from 'react';
import { Moment } from 'moment';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { YearErrorResources, YearInput } from '@helsenorge/date-time/components/year-input';
import { Validation } from '@helsenorge/form/components/form/validation';
import { getId, isReadOnly, isRequired } from '../../../util';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
import { createDateFromYear } from '../../../util/createDateFromYear';

interface Props {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  resources?: Resources;
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

export class DateYearInput extends React.Component<Props, {}> {
  getYear = (): (number | undefined)[] | undefined => {
    if (Array.isArray(this.props.answer)) {      
      return this.props.answer.map(m => createDateFromYear(this.props.item, m)?.getFullYear());
    }
  };

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

  getPDFValue = (): string => {
    const ikkeBesvartText = this.props.resources?.ikkeBesvart || '';
    return this.getYear()?.map(m => m?.toString()).join(', ') || ikkeBesvartText;
  };

  render(): JSX.Element {
    if (this.props.pdf || isReadOnly(this.props.item)) {
      return (
        <TextView id={this.props.id} item={this.props.item} value={this.getPDFValue()} onRenderMarkdown={this.props.onRenderMarkdown}>
          {this.props.children}
        </TextView>
      );
    }

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
          value={this.getYear()?.[0]}
          className={this.props.className}
          onChange={this.onYearChange}
          helpButton={this.props.helpButton}
          helpElement={this.props.helpElement}
        />
      </Validation>
    );
  }
}
