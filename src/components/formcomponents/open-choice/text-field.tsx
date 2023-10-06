import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Validation from '@helsenorge/designsystem-react/components/Validation';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue } from '../../../util/extension';
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
import { Resources } from '../../../util/resources';

interface Props {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
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

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // showLabel={false}
  // pattern={getRegexExtension(item)}
  // validateOnExternalUpdate={true}
  // FORANDRET ONBLUR TIL ONCHANGE

  return (
    <Validation {...other}>
      <Input
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
    </Validation>
  );
};

export default textField;
