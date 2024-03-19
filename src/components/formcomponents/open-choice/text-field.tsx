import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';

import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getPlaceholder } from '../../../util/extension';
import { getId, getStringValue, getPDFStringValue, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
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
  path: Path[];
  children?: React.ReactNode;
}
const textField = ({
  id,
  pdf,
  item,
  questionnaire,
  answer,
  handleStringChange,
  children,
  onRenderMarkdown,
  resources,
  path,
}: Props): JSX.Element | null => {
  if (pdf) {
    return (
      <Pdf item={item} value={getPDFStringValue(answer)}>
        {children}
      </Pdf>
    );
  }

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const formId = createFromIdFromPath(path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);
  return (
    <FormGroup error={error?.message} mode="ongrey">
      <Input
        {...(register(formId),
        {
          onChange: handleStringChange,
        })}
        type="text"
        inputId={getId(id)}
        value={getStringValue(answer)}
        defaultValue={getStringValue(answer)}
        label={
          <Label
            labelTexts={[{ text: labelText, type: 'semibold' }]}
            sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          />
        }
        placeholder={getPlaceholder(item)}
      />
    </FormGroup>
  );
};

export default textField;
