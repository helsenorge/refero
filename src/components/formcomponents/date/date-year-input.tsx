// import React from 'react';

import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { getId, isReadOnly, isRequired } from '../../../util';
import { createDateFromYear } from '../../../util/createDateFromYear';
import { validateYearDigits, validateYearMax, validateYearMin } from '../../../util/date-utils';
import { getValidationTextExtension } from '../../../util/extension';
import TextView from '../textview';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import { useState } from 'react';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useMinMaxDate } from './useMinMaxDate';

type Props = QuestionnaireComponentItemProps & {
  onDateValueChange: (newValue: string) => void;
};

export const DateYearInput = (props: Props): JSX.Element | null => {
  const { id, pdf, item, responseItem, onDateValueChange, idWithLinkIdAndItemIndex, children } = props;
  const { formState, getFieldState, control } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const answer = useGetAnswer(responseItem, item);
  const { resources } = useExternalRenderContext();
  const { error } = fieldState;
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { minDateTime, maxDateTime } = useMinMaxDate(item);
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
    <FormGroup error={getErrorText(error)} errorWrapperClassName={styles.paddingBottom}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-input`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
        afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
      />
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
              return validateYearMin(minDateTime, value, resources);
            },
            validMaxDate: value => {
              return validateYearMax(maxDateTime, value, resources);
            },
          },
        }}
        control={control}
        render={({ field: { onChange, ...rest } }): JSX.Element => (
          <Input
            {...rest}
            inputId={`${getId(id)}-input`}
            type="number"
            testId={getId(id)}
            onChange={e => {
              onChange(e.target.value);
              onYearChange(Number(e.target.value));
            }}
            value={answerState ?? ''}
            width={10}
          />
        )}
      />
    </FormGroup>
  );
};
