import React from 'react';

import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { getPlaceholder } from '../../../util/extension';
import { isReadOnly, getId, getStringValue } from '../../../util/index';
import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';

type Props = QuestionnaireComponentItemProps & {
  handleStringChange: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  handleChange: (value: string) => void;
  pdfValue?: string | number;
};
const ExtraTextField = (props: Props): JSX.Element | null => {
  const { id, pdf, handleStringChange, handleChange, children, idWithLinkIdAndItemIndex, linkId, path, pdfValue } = props;
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { validateScriptInjection, resources } = useExternalRenderContext();
  const formName = `${idWithLinkIdAndItemIndex}-extra-field`;
  const { error } = getFieldState(formName, formState);

  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const answer = useGetAnswer(linkId, path);
  const value = getStringValue(answer);
  const errorMessage = getErrorMessage(item, error);

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement, Element>): void => {
    handleStringChange(e);
  };

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    minLength: minLength({ item, resources }),
    maxLength: maxLength({ item, resources }),
    pattern: regexpPattern({ item, resources }),
    validate: (value: string): string | true | undefined =>
      scriptInjection({ value, resources, shouldValidate: !!validateScriptInjection }),
    shouldUnregister: true,
  };
  const { onChange, onBlur, ...rest } = register(
    `${idWithLinkIdAndItemIndex}-extra-field`,
    shouldValidate(item, pdf) ? validationRules : undefined
  );

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={value}
        pdfValue={pdfValue}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <FormGroup error={errorMessage} onColor="ongrey" errorWrapperClassName={styles.paddingBottom}>
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
        onColor="ongrey"
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

export default ExtraTextField;
