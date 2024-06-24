import React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getId, isReadOnly, isRequired } from '../../../util';
import { createDateFromYear } from '../../../util/createDateFromYear';
import { validateYearDigits, validateYearMax, validateYearMin } from '../../../util/date-utils';
import { getValidationTextExtension } from '../../../util/extension';
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
  maxDate,
  minDate,
  answer,
  idWithLinkIdAndItemIndex,
  error,
  control,
  children,
}: React.PropsWithChildren<Props>): JSX.Element => {
  const getYear = (answer: QuestionnaireResponseItemAnswer): (number | undefined)[] | undefined => {
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
      getYear(answer)
        ?.map(m => m?.toString())
        .join(', ') || ikkeBesvartText
    );
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

  const answerState = answer ? Number(answer.valueDate) : getYear(answer)?.[0];

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
    <FormGroup error={getErrorText(error)}>
      {helpElement}
      <Controller
        name={idWithLinkIdAndItemIndex}
        shouldUnregister={true}
        rules={{
          required: {
            value: isRequired(item),
            message: resources?.year_field_required || '',
          },
          validate: {
            validYear: value => {
              return validateYearDigits(value, resources);
            },
            validMinDate: value => {
              return validateYearMin(minDate, value, resources);
            },
            validMaxDate: value => {
              return validateYearMax(maxDate, value, resources);
            },
          },
        }}
        control={control}
        render={({ field: { onChange, ...rest } }): JSX.Element => (
          <Input
            {...rest}
            type="number"
            testId={getId(id)}
            onChange={e => {
              onChange(e.target.value);
              onYearChange(Number(e.target.value));
            }}
            label={
              <Label
                labelId={`${getId(id)}-label-dateYear`}
                labelTexts={[{ text: label || '' }]}
                sublabel={<Sublabel id={`${getId(id)}-sublabel-dateYear`} sublabelTexts={[{ text: subLabel || '', type: 'normal' }]} />}
                afterLabelChildren={helpButton}
              />
            }
            value={answerState ?? ''}
            width={10}
          />
        )}
      />
    </FormGroup>
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
