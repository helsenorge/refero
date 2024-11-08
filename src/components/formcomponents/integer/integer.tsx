import React from 'react';

import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { newIntegerValueAsync } from '@/actions/newValue';
import { GlobalState, useAppDispatch } from '@/reducers';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getPlaceholder } from '@/util/extension';
import { isReadOnly, getId } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { getErrorMessage, getInputWidth, maxValue, minValue, required } from '@/components/validation/rules';
import { QuestionnaireItem } from 'fhir/r4';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { ReadOnly } from '../read-only/readOnly';
import { shouldValidate } from '@/components/validation/utils';
import { useResetFormField } from '@/hooks/useResetFormField';

export type Props = QuestionnaireComponentItemProps;
const Integer = (props: Props): JSX.Element | null => {
  const { id, pdf, idWithLinkIdAndItemIndex, path, linkId, index, children } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const dispatch = useAppDispatch();
  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const answer = useGetAnswer(linkId, path);
  const getValue = (): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueInteger).filter(f => f !== undefined);
    }
    if (answer && answer.valueInteger !== undefined && answer.valueInteger !== null) {
      return answer.valueInteger;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueInteger) {
      return '';
    }
  };

  const getPDFValue = (): string | number => {
    const value = getValue();
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
  const value = getValue();

  useResetFormField(idWithLinkIdAndItemIndex, value);

  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (dispatch && path && item) {
      dispatch(newIntegerValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, item, { valueInteger: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const maxCharacters = getMaxValueExtensionValue(item) ? getMaxValueExtensionValue(item)?.toString().length : undefined;
  const baseIncrementValue = getMinValueExtensionValue(item);
  const width = getInputWidth(maxCharacters);
  const errorMessage = getErrorMessage(item, error);

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    max: maxValue({ item, resources }),
    min: minValue({ item, resources }),
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
    <div className="page_refero__component page_refero__component_integer">
      <FormGroup error={errorMessage} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label-integer`}
          testId={`${getId(id)}-integer-label`}
          sublabelId={`${getId(id)}-integer-sublabel`}
        />

        <Input
          {...rest}
          type="number"
          value={Array.isArray(value) ? value.join(', ') : value}
          inputId={getId(id)}
          testId={getId(id)}
          onChange={(e): void => {
            onChange(e);
            handleChange(e);
          }}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
          width={width}
          baseIncrementValue={baseIncrementValue}
        />
        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Integer;
