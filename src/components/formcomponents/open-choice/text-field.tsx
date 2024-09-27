import React from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import styles from '../common-styles.module.css';
import { getPlaceholder } from '../../../util/extension';
import { isReadOnly, getId, getPDFStringValue, getStringValue } from '../../../util/index';

import Pdf from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { QuestionnaireItem } from 'fhir/r4';

type Props = QuestionnaireComponentItemProps & {
  handleStringChange: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  handleChange: (value: string) => void;
};
const textField = (props: Props): JSX.Element | null => {
  const { id, pdf, handleStringChange, handleChange, children, idWithLinkIdAndItemIndex, linkId, path } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const formName = `${idWithLinkIdAndItemIndex}-extra-field`;

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(formName, formState);
  const answer = useGetAnswer(linkId, path);
  const { validateScriptInjection, resources } = useExternalRenderContext();
  if (pdf) {
    return (
      <Pdf item={item} value={getPDFStringValue(answer)}>
        {children}
      </Pdf>
    );
  }
  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement, Element>): void => {
    handleStringChange(e);
  };

  const value = getStringValue(answer);
  const { onChange, onBlur, ...rest } = register(`${idWithLinkIdAndItemIndex}-extra-field`, {
    required: required({ item, resources }),
    minLength: minLength({ item, resources }),
    maxLength: maxLength({ item, resources }),
    pattern: regexpPattern({ item, resources }),
    validate: (value: string): string | true | undefined =>
      scriptInjection({ value, resources, shouldValidate: !!validateScriptInjection }),
    shouldUnregister: true,
  });
  return (
    <FormGroup error={error?.message} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-extra-field`}
        labelId={`${getId(id)}-extra-field-label`}
        testId={`${getId(id)}-label`}
        sublabelId={`${getId(id)}-sublabel`}
      />

      <Input
        {...rest}
        disabled={isReadOnly(item)}
        type="text"
        mode="ongrey"
        inputId={`${getId(id)}-extra-field`}
        testId={`${getId(id)}-extra-field`}
        value={value}
        placeholder={getPlaceholder(item)}
        readOnly={isReadOnly(item)}
        onChange={(e): void => {
          onChange(e);
          handleChange(e.target.value);
        }}
        onBlur={(e): void => {
          handleOnBlur(e);
          onChange(e);
          onBlur(e);
        }}
      />
    </FormGroup>
  );
};

export default textField;
