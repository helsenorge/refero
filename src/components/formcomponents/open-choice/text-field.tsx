import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ValidationRule, useFormContext } from 'react-hook-form';

import { ValidationProps } from '../../../types/formTypes/validation';
import { Resources } from '../../../types/resources';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getStringValue,
  getPDFStringValue,
  getMaxLength,
  getSublabelText,
  renderPrefix,
  getText,
} from '../../../util/index';
import Pdf from '../textview';

interface Props {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  answer: QuestionnaireResponseItemAnswer;
  handleStringChange: (event: React.FormEvent<{}>) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  resources?: Resources;
}
const textField: React.SFC<Props & ValidationProps> = ({
  id,
  pdf,
  item,
  questionnaire,
  answer,
  handleStringChange,
  children,
  onRenderMarkdown,
  resources,
}) => {
  if (pdf) {
    return (
      <Pdf item={item} value={getPDFStringValue(answer)}>
        {children}
      </Pdf>
    );
  }
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(getId(item.linkId));
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // showLabel={false}
  // validateOnExternalUpdate={true}
  // FORANDRET ONBLUR TIL ONCHANGE
  const pattern: ValidationRule<RegExp> | undefined = getRegexExtension(item)
    ? new RegExp(getRegexExtension(item) as string, 'g')
    : undefined;
  const minLength = getMinLengthExtensionValue(item);
  const maxLength = getMaxLength(item);
  const validationText = getValidationTextExtension(item) || '';
  return (
    <Validation errorSummary={error?.message}>
      <Input
        {...register(getId(item.linkId), {
          required: isRequired(item),
          onChange: handleStringChange,
          onBlur: handleStringChange,
          pattern,
          disabled: isReadOnly(item),
          min: minLength && { value: minLength, message: validationText },
          max: maxLength && { value: maxLength, message: validationText },
        })}
        type="text"
        inputId={getId(id)}
        defaultValue={getStringValue(answer)}
        label={
          <Label
            labelTexts={[{ text: labelText, type: 'semibold' }]}
            sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          />
        }
        placeholder={getPlaceholder(item)}
      />
    </Validation>
  );
};

export default textField;
