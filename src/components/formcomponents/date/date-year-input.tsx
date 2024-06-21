import React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldValues, useFormContext } from 'react-hook-form';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getId, isReadOnly, isRequired } from '../../../util';
import { createDateFromYear } from '../../../util/createDateFromYear';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

interface Props extends FormProps, WithCommonFunctionsAndEnhancedProps {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  resources?: Resources;
  label?: string;
  subLabel?: string;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  maxDate?: Date;
  minDate?: Date;
  answer: QuestionnaireResponseItemAnswer;
}

export const DateYearInput = ({
  id,
  pdf,
  item,
  resources,
  label,
  subLabel,
  helpButton,
  helpElement,
  onDateValueChange,
  onRenderMarkdown,
  answer,
  idWithLinkIdAndItemIndex,
  children,
}: React.PropsWithChildren<Props>): JSX.Element => {
  const { register } = useFormContext<FieldValues>();
  const [answerState, setAnswerState] = React.useState<number | undefined>(0);

  const getYear = (): (number | undefined)[] | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(m => createDateFromYear(item, m)?.getFullYear());
    }
  };

  const onYearChange = (year: number): void => {
    onDateValueChange(year === 0 ? '' : year.toString());
  };

  const getPDFValue = (): string => {
    const ikkeBesvartText = resources?.ikkeBesvart || '';
    return (
      getYear()
        ?.map(m => m?.toString())
        .join(', ') || ikkeBesvartText
    );
  };

  React.useEffect(() => {
    answer ? setAnswerState(Number(answer.valueDate)) : setAnswerState(getYear()?.[0]);
  }, [answer]);

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
      {helpElement}
      <Input
        {...register(idWithLinkIdAndItemIndex + '-dateYear', {
          required: {
            value: isRequired(item),
            message: resources?.formRequiredErrorMessage || '',
          },
          validate: {},
        })}
        type="number"
        testId={getId(id)}
        onChange={e => onYearChange(Number(e.target.value))}
        label={
          <Label
            labelId={`${getId(id)}-label-dateYear`}
            labelTexts={[{ text: label || '' }]}
            sublabel={<Sublabel id={`${getId(id)}-sublabel-dateYear`} sublabelTexts={[{ text: subLabel || '', type: 'normal' }]} />}
            afterLabelChildren={helpButton}
          />
        }
        defaultValue={answerState}
      />
    </>
  );
};

// function getYearInputResources(): YearErrorResources {
//   // Vi får maks én valideringstekst, derfor settes alle til denne.
//   const validationErrorText = getValidationTextExtension(item);

//   return {
//     errorInvalidYear: validationErrorText ? validationErrorText : resources?.year_field_invalid || '',
//     errorRequiredYear: resources?.year_field_required || '',
//     errorYearBeforeMinDate: resources?.year_field_mindate || '',
//     errorYearAfterMaxDate: resources?.year_field_maxdate || '',
//   };
// }
