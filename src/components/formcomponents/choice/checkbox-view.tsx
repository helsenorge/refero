import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Collapse } from 'react-collapse';
import { useFormContext } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { getId, getSublabelText, getText, isRequired } from '../../../util/index';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children: React.ReactNode;
}

const CheckboxView = ({
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
  onRenderMarkdown,
  renderHelpButton,
}: Props): JSX.Element | null => {
  if (!options) {
    return null;
  }

  const checkboxes = options.map(el => {
    return { label: el.label, id: el.type, checked: isSelected(el, selected), disabled: el.disabled };
  });
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const handleCheckboxChange = (checkboxId: string): void => {
    handleChange(checkboxId);
  };

  // CheckboxGroup:
  // id={getId(id)}
  // max={getMaxOccursExtensionValue(item)}
  // min={getMinOccursExtensionValue(item)}
  // helpButton={el.hjelpetrigger}
  // validateOnExternalUpdate={validateOnExternalUpdate}

  // Checkbox:
  // isStyleBlue={this.props.isStyleBlue}
  const getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? resources?.formRequiredErrorMessage : undefined;
  };
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(getId(item.linkId));
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <Collapse isOpened>
        <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} error={error?.message}>
          {checkboxes.map((checkbox, index) => (
            <Checkbox
              {...register(getId(item.linkId), {
                required: { value: isRequired(item), message: getRequiredErrorMessage(item) || '' },
                onChange: (): void => handleCheckboxChange(checkbox.id),
              })}
              inputId={`${id}-${checkbox.id}`}
              testId={`checkbox-choice`}
              key={`${checkbox.id}-${index.toString()}`}
              label={
                <Label
                  labelTexts={[{ text: checkbox.label }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={<>{renderHelpButton()}</>}
                />
              }
              checked={checkbox.checked}
              disabled={checkbox.disabled}
              required={isRequired(item)}
            />
          ))}
        </FormGroup>
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </Collapse>
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
