import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import SafeInputField from '@helsenorge/form/components/safe-input-field';

import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getStringValue, getPDFStringValue, getMaxLength, getSublabelText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import Label from '../label';
import SubLabel from '../sublabel';
import Pdf from '../textview';

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
const textField: React.SFC<Props> = ({
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
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  return (
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
  );
};

export default textField;
