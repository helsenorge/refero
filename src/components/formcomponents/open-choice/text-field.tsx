import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';

import Validation from '@helsenorge/form/components/form/validation';
import { ValidationProps } from '@helsenorge/form/components/form/validation';
import SafeInputField from '@helsenorge/form/components/safe-input-field';

import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getStringValue, getPDFStringValue, getMaxLength, getSublabelText } from '../../../util/index';
import Label from '../label';
import SubLabel from '../sublabel';
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
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  return (
    <Validation {...other}>
      <SafeInputField
        type="text"
        id={getId(id)}
        inputName={getId(id)}
        value={getStringValue(answer)}
        showLabel={false}
        label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
        subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
        isRequired={isRequired(item)}
        placeholder={getPlaceholder(item)}
        minLength={getMinLengthExtensionValue(item)}
        maxLength={getMaxLength(item)}
        readOnly={isReadOnly(item)}
        onBlur={handleStringChange}
        pattern={getRegexExtension(item)}
        errorMessage={getValidationTextExtension(item)}
        validateOnExternalUpdate={true}
      />
    </Validation>
  );
};

export default textField;
