import React from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { getPlaceholder } from '../../../util/extension';
import { isReadOnly, getId, getPDFStringValue, getStringValue } from '../../../util/index';

import Pdf from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';
import { useExternalRenderContext } from '@/context/externalRenderContext';

type Props = QuestionnaireComponentItemProps & {
  handleStringChange: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  handleChange: (value: string) => void;
};
const textField = (props: Props): JSX.Element | null => {
  const { id, pdf, item, handleStringChange, handleChange, children, resources, idWithLinkIdAndItemIndex, responseItem } = props;
  const formName = `${idWithLinkIdAndItemIndex}-extra-field`;

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(formName, formState);
  const answer = useGetAnswer(responseItem, item);
  const { validateScriptInjection } = useExternalRenderContext();
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
    <FormGroup error={error?.message} mode="ongrey">
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
