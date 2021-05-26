import * as React from 'react';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { isReadOnly, isRequired, getId, getStringValue, getPDFStringValue, getMaxLength, getSublabelText } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import Pdf from '../textview';
import SubLabel from '../sublabel';
import Label from '../label';

interface Props {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer;
  handleStringChange: (event: React.FormEvent<{}>) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}
const textField: React.SFC<Props & ValidationProps> = ({
  id,
  pdf,
  item,
  answer,
  handleStringChange,
  children,
  onRenderMarkdown,
  ...other
}) => {
  if (pdf) {
    return (
      <Pdf item={item} value={getPDFStringValue(answer)}>
        {children}
      </Pdf>
    );
  }
  const subLabelText = getSublabelText(item, onRenderMarkdown);

  return (
    <Validation {...other}>
      <SafeInputField
        type="text"
        id={getId(id)}
        inputName={getId(id)}
        value={getStringValue(answer)}
        showLabel={false}
        label={<Label item={item} onRenderMarkdown={onRenderMarkdown} />}
        subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
        isRequired={isRequired(item)}
        placeholder={getPlaceholder(item)}
        minLength={getMinLengthExtensionValue(item)}
        maxLength={getMaxLength(item)}
        readOnly={isReadOnly(item)}
        onBlur={handleStringChange}
        pattern={getRegexExtension(item)}
        errorMessage={getValidationTextExtension(item)}
        allowInputOverMaxLength
        validateOnExternalUpdate={true}
      />
    </Validation>
  );
};

export default textField;
