import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Moment } from 'moment';
import { useFormContext } from 'react-hook-form';

import { Resources } from '../../../types/resources';

import Validation from '@helsenorge/designsystem-react/components/Validation';

import { YearErrorResources, YearInput } from '@helsenorge/date-time/components/year-input';

import { getId, isReadOnly, isRequired } from '../../../util';
import { createDateFromYear } from '../../../util/createDateFromYear';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import TextView from '../textview';

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
  };

  React.useEffect(() => {
    props.answer ? setAnswerState(Number(props.answer.valueDate)) : setAnswerState(getYear()?.[0]);
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

  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(getId(props.id));

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
    <YearInput
      {...register(getId(props.id), { required: { value: isRequired(props.item), message: props.resources?.dateRequired || '' } })}
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
  );
};
