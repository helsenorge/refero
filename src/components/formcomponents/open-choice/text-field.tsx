import React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getPDFStringValue, getMaxLength, getStringValue } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import Pdf from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';

interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  answer: QuestionnaireResponseItemAnswer;
  handleStringChange: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  handleChange: (value: string) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  resources?: Resources;
  children: React.ReactNode;
}
const textField = ({
  id,
  pdf,
  item,
  questionnaire,
  answer,
  handleStringChange,
  handleChange,
  children,
  onRenderMarkdown,
  resources,
  idWithLinkIdAndItemIndex,
}: Props): JSX.Element | null => {
  const formName = `${idWithLinkIdAndItemIndex}-extra-field`;
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const { error } = getFieldState(formName, formState);
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

  const maxLength = getMaxLength(item);
  const minLength = getMinLengthExtensionValue(item);
  const pattern = getRegexExtension(item);
  const errorMessage = getValidationTextExtension(item);

  return (
    <FormGroup error={error?.message} mode="ongrey">
      <ReferoLabel
        item={item}
        onRenderMarkdown={onRenderMarkdown}
        questionnaire={questionnaire}
        resources={resources}
        htmlFor={`${getId(id)}-extra-field`}
        labelId={`${getId(id)}-extra-field-label`}
        testId={`${getId(id)}-label`}
        sublabelId={`${getId(id)}-sublabel`}
      />
      <Controller
        name={`${idWithLinkIdAndItemIndex}-extra-field`}
        shouldUnregister={true}
        defaultValue={getStringValue(answer)}
        rules={{
          required: {
            value: isRequired(item),
            message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
          },
          ...(minLength && {
            minLength: {
              value: minLength || 0,
              message: errorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for kort',
            },
          }),
          ...(maxLength && {
            maxLength: {
              value: maxLength,
              message: errorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for lang',
            },
          }),
          ...(pattern && {
            pattern: {
              value: new RegExp(pattern),
              message: errorMessage ?? 'Det er en feil på feltet',
            },
          }),
        }}
        render={({ field: { onChange, ref, name, onBlur } }): JSX.Element => (
          <Input
            name={name}
            ref={ref}
            disabled={isReadOnly(item)}
            type="text"
            mode="ongrey"
            inputId={`${getId(id)}-extra-field`}
            testId={`${getId(id)}-extra-field`}
            value={getStringValue(answer)}
            placeholder={getPlaceholder(item)}
            readOnly={isReadOnly(item)}
            onChange={(e): void => {
              onChange(e.target.value);
              handleChange(e.target.value);
            }}
            onBlur={(e): void => {
              handleOnBlur(e);
              onChange(e.target.value);
              onBlur();
            }}
          />
        )}
      />
    </FormGroup>
  );
};

export default textField;
