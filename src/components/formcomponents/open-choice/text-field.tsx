import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getPDFStringValue,
  getMaxLength,
  getSublabelText,
  getLabelText,
  getStringValue,
} from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import Pdf from '../textview';

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
}
const textField: React.FC<Props> = ({
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
}) => {
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

  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const maxLength = getMaxLength(item);
  const minLength = getMinLengthExtensionValue(item);
  const pattern = getRegexExtension(item);
  const errorMessage = getValidationTextExtension(item);

  return (
    <FormGroup error={error?.message} mode="ongrey">
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
            label={
              <Label
                htmlFor={`${getId(id)}-extra-field`}
                labelTexts={[{ text: labelText, type: 'semibold' }]}
                sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              />
            }
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
