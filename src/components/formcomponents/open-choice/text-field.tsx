import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { ValidationProps } from '../../../types/form types/validation';

import Validation from '@helsenorge/designsystem-react/components/Validation';
import Input from '@helsenorge/designsystem-react/components/Input'

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
  // const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  //showLabel={false}
  //subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
  //pattern={getRegexExtension(item)}
  //validateOnExternalUpdate={true}
  //FORANDRET ONBLUR TIL ONCHANGE

  return (
    <Validation {...other}>
      <Input
        type="text"
        inputId={getId(id)}
        name={getId(id)}
        value={getStringValue(answer)}
        label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
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
