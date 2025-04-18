import React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { newDecimalValueAsync } from '@/actions/newValue';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import {
  createMaxDecimalPlacesValidator,
  createRegexpValidator,
  getErrorMessage,
  getInputWidth,
  maxValue,
  minValue,
  required,
} from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppSelector, useAppDispatch } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getMaxDecimalPlacesExtensionValue, getMaxValueExtensionValue, getPlaceholder } from '@/util/extension';
import { isReadOnly, getId } from '@/util/index';

export type Props = QuestionnaireComponentItemProps;

const Decimal = (props: Props): JSX.Element | null => {
  const { id, linkId, pdf, children, idWithLinkIdAndItemIndex, path, index } = props;
  const { formState, getFieldState, register, getValues } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex || '', formState);
  const { error } = fieldState;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const answer = useGetAnswer(linkId, path);

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const dispatch = useAppDispatch();

  const getValue = (
    item?: QuestionnaireItem,
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueDecimal).filter(f => f !== undefined);
    }
    if (answer && answer.valueDecimal !== undefined && answer.valueDecimal !== null) {
      return answer.valueDecimal;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueDecimal) {
      return '';
    }
  };
  const answerValue = getValue(item, answer);
  const value = getValues(idWithLinkIdAndItemIndex) ? getValues(idWithLinkIdAndItemIndex) : answerValue;
  useResetFormField(idWithLinkIdAndItemIndex, value);
  const getPDFValue = (): string | number => {
    if (value === undefined || value === null || value === '') {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value;

    if (item) {
      const newValueConverted = parseFloat(newValue);
      dispatch(newDecimalValueAsync(path || [], newValueConverted, item))?.then(newState => {
        return onAnswerChange(newState, item, { valueDecimal: newValueConverted });
      });
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const maxCharacters = getMaxValueExtensionValue(item) ? getMaxValueExtensionValue(item)?.toString().length : undefined;
  const maxDecimals = getMaxDecimalPlacesExtensionValue(item) ? getMaxDecimalPlacesExtensionValue(item) : undefined;
  const width = getInputWidth(maxCharacters, true, maxDecimals);
  const errorMessage = getErrorMessage(item, error);

  const validationRules: RegisterOptions<FieldValues, string> = {
    required: required({ item, resources }),
    min: minValue({ item, resources }),
    max: maxValue({ item, resources }),
    validate: {
      'max-decimal-places': createMaxDecimalPlacesValidator({ item, resources }),
      'regexp-pattern': createRegexpValidator({ item, resources }),
    },
    shouldUnregister: true,
  };
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={value}
        pdfValue={getPDFValue()}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_decimal">
      <FormGroup error={errorMessage} onColor="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label-decimal`}
          testId={`${getId(id)}-decimal-label`}
          sublabelId={`${getId(id)}-decimal-sublabel`}
        />
        <Input
          {...rest}
          type="number"
          inputId={getId(id)}
          testId={getId(id)}
          value={value}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
          onChange={(e): void => {
            handleChange(e);
            onChange(e);
          }}
          inputMode="decimal"
          width={width}
        />
      </FormGroup>
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Decimal;
