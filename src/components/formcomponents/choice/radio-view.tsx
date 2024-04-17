import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { getValidationTextExtension } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText, renderPrefix, getTextValidationErrorMessage } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends FormProps, WithCommonFunctionsAndEnhancedProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  getErrorMessage: (val: string) => string;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const RadioView: React.FC<Props> = ({
  options,
  item,
  questionnaire,
  id,
  handleChange,
  selected,
  resources,
  children,
  repeatButton,
  renderDeleteButton,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
  register,
  error,
}) => {
  const selectedValue = (selected && selected[0]) || '';
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
      <FormGroup mode="ongrey" error={error?.message}>
        {renderHelpElement()}
        <Label
          labelTexts={[{ text: labelText }]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          afterLabelChildren={renderHelpButton()}
        />
        {options?.map((option: Options, index: number) => (
          <RadioButton
            {...register(item.linkId, {
              required: {
                value: isRequired(item),
                message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? 'Feltet må fylles ut',
              },
              onChange: (): void => {
                handleChange(option.type);
              },
              value: option.type,
            })}
            key={getId(id) + index}
            inputId={`${getId(id)}-hn- + ${index}`}
            mode="ongrey"
            label={<Label labelTexts={[{ text: option.label }]} />}
            defaultChecked={selectedValue === option?.type}
          />
        ))}
      </FormGroup>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

export default RadioView;
