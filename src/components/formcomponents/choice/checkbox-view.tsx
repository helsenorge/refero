import * as React from 'react';

import { Collapse } from 'react-collapse';

import { QuestionnaireItem, Questionnaire } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import Validation from '@helsenorge/designsystem-react/components/Validation';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getValidationTextExtension } from '../../../util/extension';
import { getSublabelText, getText } from '../../../util/index';
import { Resources } from '../../../util/resources';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const CheckboxView: React.SFC<Props> = ({
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
  ...other
}) => {
  if (!options) {
    return null;
  }

  const checkboxes = options.map(el => {
    return { label: el.label, id: el.type, checked: isSelected(el, selected) };
  });
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // CheckboxGroup:
  // handleChange={handleChange}
  // required={isRequired(item)}
  // id={getId(id)}
  // max={getMaxOccursExtensionValue(item)}
  // min={getMinOccursExtensionValue(item)}
  // helpButton={el.hjelpetrigger}
  // validateOnExternalUpdate={validateOnExternalUpdate}

  // Checkbox:
  // isStyleBlue={this.props.isStyleBlue}
  // disabled={el.disabled}

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <Collapse isOpened>
        <Validation {...other}>
          <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)}>
            {checkboxes.map((checkbox, index) => (
              <Checkbox
              label={
                <Label
                  labelTexts={[{ text: checkbox.label, type: 'semibold' }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                />
              }
                key={checkbox.id + index.toString()}
                inputId={`${id}-${checkbox.id}`}
                checked={checkbox.checked}
                onChange={() => handleChange(checkbox.id)}
                testId={`${id}-${checkbox.id}`}
              />
            ))}
          </FormGroup>
        </Validation>
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
