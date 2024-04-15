import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

// import { getMaxOccursExtensionValue, getMinOccursExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { isRequired, getSublabelText, getText, renderPrefix } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const CheckboxView: React.FC<Props> = ({
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
}) => {
  const checkboxes = options?.map(el => {
    return { label: el.label, id: el.type, checked: isSelected(el, selected), disabled: el.disabled };
  });
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <FormGroup mode="ongrey">
        {renderHelpElement()}
        <Label
          labelTexts={[{ text: labelText }]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          afterLabelChildren={renderHelpButton()}
        />
        {checkboxes?.map((checkbox, index) => (
          <Checkbox
            {...register(item.linkId, {
              required: isRequired(item),
            })}
            onChange={(): void => handleChange(checkbox.id)}
            inputId={`${id}-${checkbox.id}`}
            testId={`checkbox-choice`}
            key={`${checkbox.id}-${index.toString()}`}
            value={checkbox.id}
            required={isRequired(item)}
            label={<Label labelTexts={[{ text: checkbox.label }]} />}
            checked={checkbox.checked}
            disabled={checkbox.disabled}
          />
        ))}
      </FormGroup>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

function isSelected(el: Options, selected?: Array<string | undefined>): boolean {
  if (selected) {
    for (let i = 0; i < selected.length; i++) {
      if (el.type === selected[i]) {
        return true;
      }
    }
  }
  return false;
}

export default CheckboxView;
