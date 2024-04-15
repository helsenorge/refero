import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

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
  children,
  onRenderMarkdown,
  resources,
  register,
}) => {
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

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  return (
    <Input
      {...register(item.linkId, {
        required: isRequired(item),
        onChange: handleOnBlur,
        onBlur: handleOnBlur,
      })}
      type="text"
      inputId={getId(id)}
      name={getId(id)}
      value={getStringValue(answer)}
      label={
        <Label
          labelTexts={[{ text: labelText, type: 'semibold' }]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
        />
      }
      placeholder={getPlaceholder(item)}
      // minLength={getMinLengthExtensionValue(item)}
      // maxLength={getMaxLength(item)}
      readOnly={isReadOnly(item)}
      // pattern={getRegexExtension(item)}
      // errorMessage={getValidationTextExtension(item)}
      // validateOnExternalUpdate={true}
    />
  );
};

export default textField;
