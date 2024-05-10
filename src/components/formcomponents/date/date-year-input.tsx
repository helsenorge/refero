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

export const DateYearInput = (props: React.PropsWithChildren<Props>): JSX.Element => {

  const [answerState, setAnswerState] = React.useState<number | undefined>(0);

  const getYear = (): (number | undefined)[] | undefined => {
    if (Array.isArray(props.answer)) {
      return props.answer.map(m => createDateFromYear(props.item, m)?.getFullYear());
    }

    // in case of props.answer is not an array
    return answerState
  };

  React.useEffect(() => {
    props.answer ? setAnswerState(Number(props.answer.valueDate)) : setAnswerState(getYear()?.[0])
  }, [props.answer]);

  function getYearInputResources(): YearErrorResources {
    const { resources, item } = props;
    // Vi får maks én valideringstekst, derfor settes alle til denne.
    const validationErrorText = getValidationTextExtension(item);

    return {
      errorInvalidYear: validationErrorText ? validationErrorText : resources?.year_field_invalid || '',
      errorRequiredYear: resources?.year_field_required || '',
      errorYearBeforeMinDate: resources?.year_field_mindate || '',
      errorYearAfterMaxDate: resources?.year_field_maxdate || '',
    };
  }

  const onYearChange = (year: number): void => {
    props.onDateValueChange(year === 0 ? '' : year.toString());
  };

  const getPDFValue = (): string => {
    const ikkeBesvartText = props.resources?.ikkeBesvart || '';
    return (
      getYear()
        ?.map(m => m?.toString())
        .join(', ') || ikkeBesvartText
    );
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
      <YearInput
        id={`${getId(props.id)}-year_input`}
        errorResources={getYearInputResources()}
        label={props.label}
        subLabel={props.subLabel}
        isRequired={isRequired(props.item)}
        placeholder={getPlaceholder(props.item)}
        maximumYear={props.maxDate?.year()}
        minimumYear={props.minDate?.year()}
        value={answerState}
        className={props.className}
        onChange={onYearChange}
        helpButton={props.helpButton}
        helpElement={props.helpElement}
      />
    </Validation>
  );
};
