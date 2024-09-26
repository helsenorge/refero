import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { getId, isReadOnly, isRequired } from '../../../util';
import { validateYearDigits, validateYearMax, validateYearMin } from '../../../util/date-utils';
import { getValidationTextExtension } from '../../../util/extension';
import TextView from '../textview';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import { useState } from 'react';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useMinMaxDate } from './useMinMaxDate';
import { initialize } from '@/util/date-fns-utils';

type Props = QuestionnaireComponentItemProps & {
  onDateValueChange: (newValue: string) => void;
};

export const DateYearInput = (props: Props): JSX.Element | null => {
  initialize();

  const { id, pdf, item, responseItem, onDateValueChange, idWithLinkIdAndItemIndex, children } = props;
  const { formState, getFieldState, control } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const answer = useGetAnswer(responseItem, item);
  const { resources } = useExternalRenderContext();
  const { error } = fieldState;
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { minDateTime, maxDateTime } = useMinMaxDate(item);

  const getYearValue = (answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): string | undefined => {
    const answerValue = Array.isArray(answer) ? answer[0] : answer;
    if (answerValue && answerValue.valueDate) {
      return answerValue.valueDate;
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate) {
      return undefined;
    }
    return item.initial[0].valueDate;
  };

  const onYearChange = (year: string | undefined): void => {
    onDateValueChange(year ?? '');
  };

  const getPDFValue = (yearValue: string | undefined): string | number => {
    if (yearValue === undefined || yearValue === null || yearValue === '') {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(yearValue)) {
      return yearValue.map(year => year).join(', ');
    }
    return yearValue;
  };

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    if (error) {
      const validationTextExtension = getValidationTextExtension(item);
      if (validationTextExtension) {
        return validationTextExtension;
      }
      return error.message;
    }
  };

  const yearValue: string | undefined = getYearValue(answer);

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue(yearValue)}>
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
              onYearChange(e.target.value);
              onChange(e.target.value);
            }}
            value={yearValue}
            width={10}
          />
        )}
      />
    </FormGroup>
  );
};
