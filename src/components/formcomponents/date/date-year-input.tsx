// import React from 'react';

import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getId, isReadOnly, isRequired } from '../../../util';
import { createDateFromYear } from '../../../util/createDateFromYear';
import { validateYearDigits, validateYearMax, validateYearMin } from '../../../util/date-utils';
import { getValidationTextExtension } from '../../../util/extension';
import TextView from '../textview';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import { useState } from 'react';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import { RenderItemProps } from '../renderChildren/RenderChildrenItems';
import { useGetAnswer } from '@/hooks/useGetAnswer';

type Props = RenderItemProps & {
  label?: string;
  subLabel?: string;
  children?: React.ReactNode;
  onDateValueChange: (newValue: string) => void;
  maxDate?: Date;
  minDate?: Date;
};

export const DateYearInput = (props: Props): JSX.Element => {
  const {
    id,
    pdf,
    item,
    resources,
    label,
    subLabel,
    onDateValueChange,
    maxDate,
    minDate,
    idWithLinkIdAndItemIndex,
    responseItem,
    children,
  } = props;
  const answer = useGetAnswer(responseItem, item);
  const { formState, getFieldState, control } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const getYear = (
    answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined
  ): (number | undefined)[] | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(m => createDateFromYear(item, m)?.getFullYear());
    } else if (answer) {
      const year = createDateFromYear(item, answer)?.getFullYear();
      return [year];
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

  const answerState = getYear(answer)?.[0];

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue()}>
        {children}
      </TextView>
    );
  }

  return (
    <FormGroup error={getErrorText(error)}>
      <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
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
                afterLabelChildren={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
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
