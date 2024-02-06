import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

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
import { Resources } from '../../../types/resources';
import Pdf from '../textview';
import { ValidationRule, useFormContext } from 'react-hook-form';

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
  ...other
}) => {
  if (pdf) {
    return (
      <Pdf item={item} value={getPDFStringValue(answer)}>
        {children}
      </Pdf>
    );
  }
  const { register } = useFormContext();

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // showLabel={false}
  // pattern={getRegexExtension(item)}
  // validateOnExternalUpdate={true}
  // FORANDRET ONBLUR TIL ONCHANGE
  const pattern: ValidationRule<RegExp> | undefined = getRegexExtension(item)
    ? new RegExp(getRegexExtension(item) as string, 'g')
    : undefined;
  return (
    <Input
      {...register(getId(item.linkId), { required: isRequired(item), onChange: handleStringChange, onBlur: handleStringChange, pattern })}
      type="text"
      inputId={getId(id)}
      name={getId(id)}
      defaultValue={getStringValue(answer)}
      label={
        <Label
          labelTexts={[{ text: labelText, type: 'semibold' }]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
        />
      }
      required={isRequired(item)}
      placeholder={getPlaceholder(item)}
      min={getMinLengthExtensionValue(item)}
      max={getMaxLength(item)}
      readOnly={isReadOnly(item)}
      onChange={handleStringChange}
      errorText={getValidationTextExtension(item)}
    />
  );
};

export default textField;
